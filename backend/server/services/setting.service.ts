import { SettingRepository } from '../repositories/setting.repository'
import type { Setting, CreateSettingInput, UpdateSettingInput } from '../shared/types'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

/**
 * Service for managing application settings with encryption support
 */
export class SettingService {
    private repository: SettingRepository
    private encryptionKey: string

    constructor() {
        this.repository = new SettingRepository()
        // Get encryption key from environment or use a default (should be 32 characters for AES-256)
        const config = useRuntimeConfig()
        this.encryptionKey = config.encryptionKey || 'default-key-please-change-this!!'
    }

    /**
     * Encrypt sensitive data
     */
    private encrypt(text: string): string {
        try {
            const iv = randomBytes(16)
            const key = Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32))
            const cipher = createCipheriv('aes-256-cbc', key, iv)

            let encrypted = cipher.update(text, 'utf8', 'hex')
            encrypted += cipher.final('hex')

            return iv.toString('hex') + ':' + encrypted
        } catch (error) {
            console.error('Encryption error:', error)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to encrypt data'
            })
        }
    }

    /**
     * Decrypt sensitive data
     */
    private decrypt(encryptedText: string): string {
        try {
            const parts = encryptedText.split(':')
            const iv = Buffer.from(parts[0], 'hex')
            const encrypted = parts[1]
            const key = Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32))
            const decipher = createDecipheriv('aes-256-cbc', key, iv)

            let decrypted = decipher.update(encrypted, 'hex', 'utf8')
            decrypted += decipher.final('utf8')

            return decrypted
        } catch (error) {
            console.error('Decryption error:', error)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to decrypt data'
            })
        }
    }

    /**
     * Mask sensitive values for display
     */
    private maskSensitiveValue(value: any): any {
        if (typeof value === 'string') {
            if (value.length <= 4) return '****'
            return value.slice(0, 4) + '****' + value.slice(-4)
        }
        if (typeof value === 'object' && value !== null) {
            const masked: any = {}
            for (const key in value) {
                masked[key] = this.maskSensitiveValue(value[key])
            }
            return masked
        }
        return value
    }

    /**
     * Process setting value for storage (encrypt if needed)
     */
    private processValueForStorage(value: Record<string, any>, isEncrypted: boolean): Record<string, any> {
        if (!isEncrypted) return value

        const processed: Record<string, any> = {}
        for (const key in value) {
            const val = value[key]
            if (typeof val === 'string' && val.trim() !== '') {
                processed[key] = this.encrypt(val)
            } else {
                processed[key] = val
            }
        }
        return processed
    }

    /**
     * Process setting value for retrieval (decrypt if needed)
     */
    private processValueForRetrieval(value: Record<string, any>, isEncrypted: boolean, maskValues: boolean = false): Record<string, any> {
        if (!isEncrypted) return value

        if (maskValues) {
            return this.maskSensitiveValue(value)
        }

        const processed: Record<string, any> = {}
        for (const key in value) {
            const val = value[key]
            if (typeof val === 'string' && val.includes(':')) {
                try {
                    processed[key] = this.decrypt(val)
                } catch {
                    processed[key] = val // If decryption fails, return as is
                }
            } else {
                processed[key] = val
            }
        }
        return processed
    }

    /**
     * Get all settings, optionally filtered by category
     */
    async getAllSettings(category?: string, maskSensitive: boolean = true): Promise<Setting[]> {
        let settings: Setting[]

        if (category) {
            settings = await this.repository.findByCategory(category)
        } else {
            const result = await this.repository.findAll()
            settings = result.data
        }

        // Process values for retrieval
        return settings.map(setting => ({
            ...setting,
            value: this.processValueForRetrieval(setting.value, setting.is_encrypted, maskSensitive)
        }))
    }

    /**
     * Get a setting by key
     */
    async getSettingByKey(key: string, maskSensitive: boolean = true): Promise<Setting | null> {
        const setting = await this.repository.findByKey(key)

        if (!setting) return null

        return {
            ...setting,
            value: this.processValueForRetrieval(setting.value, setting.is_encrypted, maskSensitive)
        }
    }

    /**
     * Create a new setting
     */
    async createSetting(input: CreateSettingInput): Promise<Setting> {
        // Auto-generate key if not provided (for multiple instances support)
        let key = input.key
        if (!key && input.api_type) {
            // Generate unique key: api_type + timestamp + random string
            const timestamp = Date.now()
            const randomStr = Math.random().toString(36).substring(2, 8)
            key = `${input.api_type}_${timestamp}_${randomStr}`
        } else if (!key) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Either key or api_type must be provided'
            })
        }

        const processedValue = this.processValueForStorage(input.value, input.is_encrypted || false)

        const setting = await this.repository.create({
            ...input,
            key,
            value: processedValue
        })

        return {
            ...setting,
            value: this.processValueForRetrieval(setting.value, setting.is_encrypted, true)
        }
    }

    /**
     * Update a setting by key
     */
    async updateSetting(key: string, updates: UpdateSettingInput): Promise<Setting> {
        console.log('updateSetting called with key:', key)
        console.log('updates:', JSON.stringify(updates, null, 2))

        const existing = await this.repository.findByKey(key)

        if (!existing) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Setting not found'
            })
        }

        console.log('existing value:', JSON.stringify(existing.value, null, 2))

        // If updating value and it's encrypted, merge with existing values
        if (updates.value && existing.is_encrypted) {
            const mergedValue: Record<string, any> = {}

            // Start with existing values
            for (const key in existing.value) {
                mergedValue[key] = existing.value[key]
            }

            // Override with new values (only if not empty)
            for (const key in updates.value) {
                const newVal = updates.value[key]
                // If new value is not empty, encrypt and use it
                // If empty, keep the existing encrypted value
                if (typeof newVal === 'string' && newVal.trim() !== '') {
                    console.log(`Encrypting new value for ${key}`)
                    mergedValue[key] = this.encrypt(newVal)
                } else {
                    console.log(`Keeping existing value for ${key}`)
                }
                // If it's not a string or is empty, keep existing value (already in mergedValue)
            }

            console.log('mergedValue:', JSON.stringify(mergedValue, null, 2))
            updates.value = mergedValue
        } else if (updates.value && updates.is_encrypted !== false) {
            // Not encrypted, just process normally
            updates.value = this.processValueForStorage(updates.value, false)
        }

        const setting = await this.repository.updateByKey(key, updates)
        console.log('Setting updated successfully')

        return {
            ...setting,
            value: this.processValueForRetrieval(setting.value, setting.is_encrypted, true)
        }
    }

    /**
     * Upsert a setting (create or update)
     */
    async upsertSetting(key: string, value: Record<string, any>, additionalData?: Partial<Setting>): Promise<Setting> {
        const isEncrypted = additionalData?.is_encrypted || false
        const processedValue = this.processValueForStorage(value, isEncrypted)

        const setting = await this.repository.upsert(key, processedValue, additionalData)

        return {
            ...setting,
            value: this.processValueForRetrieval(setting.value, setting.is_encrypted, true)
        }
    }

    /**
     * Delete a setting by key
     */
    async deleteSetting(key: string): Promise<void> {
        await this.repository.deleteByKey(key)
    }

    /**
     * Get all active API integrations
     */
    async getActiveApiIntegrations(): Promise<Setting[]> {
        const settings = await this.repository.findActive('api_integration')

        return settings.map(setting => ({
            ...setting,
            value: this.processValueForRetrieval(setting.value, setting.is_encrypted, true)
        }))
    }

    /**
     * Test API connection (placeholder - implement specific tests per API)
     */
    async testConnection(key: string): Promise<{ success: boolean; message: string }> {
        const setting = await this.repository.findByKey(key)

        if (!setting) {
            return { success: false, message: 'Setting not found' }
        }

        if (!setting.is_active) {
            return { success: false, message: 'Integration is not active' }
        }

        // TODO: Implement specific connection tests for each API
        // For now, just check if required fields are present
        const value = this.processValueForRetrieval(setting.value, setting.is_encrypted, false)
        const hasRequiredFields = Object.values(value).some(v => v && v !== '')

        return {
            success: hasRequiredFields,
            message: hasRequiredFields ? 'Configuration appears valid' : 'Missing required credentials'
        }
    }

    /**
     * Get Amazon API credentials (decrypted) for product operations
     * Returns the first active Amazon PA API configuration
     */
    async getAmazonCredentials(): Promise<{
        region: string
        access_key: string
        secret_key: string
        partner_tag: string
    } | null> {
        try {
            // Find all API integrations
            const settings = await this.repository.findByCategory('api_integration')

            // Find the first active Amazon PA API setting
            const amazonSetting = settings.find(s =>
                s.key.startsWith('amazon_pa_api') && s.is_active
            )

            if (!amazonSetting) {
                return null
            }

            // Decrypt and return the credentials
            const decryptedValue = this.processValueForRetrieval(
                amazonSetting.value,
                amazonSetting.is_encrypted,
                false // Don't mask - we need actual values
            )

            return {
                region: decryptedValue.region || 'us-east-1',
                access_key: decryptedValue.access_key || '',
                secret_key: decryptedValue.secret_key || '',
                partner_tag: decryptedValue.partner_tag || ''
            }
        } catch (error) {
            console.error('Error fetching Amazon credentials:', error)
            return null
        }
    }

    /**
     * Get API credentials by type (decrypted)
     * @param apiType - The API type (e.g., 'amazon_pa_api', 'cj_api')
     * @returns Decrypted credentials or null if not found
     */
    async getApiCredentialsByType(apiType: string): Promise<Record<string, any> | null> {
        try {
            const settings = await this.repository.findByCategory('api_integration')

            // Find the first active setting for this API type
            const apiSetting = settings.find(s =>
                s.key.startsWith(apiType) && s.is_active
            )

            if (!apiSetting) {
                return null
            }

            // Decrypt and return the credentials
            return this.processValueForRetrieval(
                apiSetting.value,
                apiSetting.is_encrypted,
                false // Don't mask - we need actual values
            )
        } catch (error) {
            console.error(`Error fetching ${apiType} credentials:`, error)
            return null
        }
    }
}
