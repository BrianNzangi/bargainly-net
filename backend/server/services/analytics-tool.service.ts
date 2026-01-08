import { AnalyticsToolRepository, AnalyticsTool } from '../repositories/analytics-tool.repository'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

export class AnalyticsToolService {
    private repository: AnalyticsToolRepository
    private encryptionKey: string

    constructor() {
        this.repository = new AnalyticsToolRepository()
        const config = useRuntimeConfig()
        this.encryptionKey = config.encryptionKey || 'default-key-please-change-this!!'
    }

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
            throw createError({ statusCode: 500, statusMessage: 'Failed to encrypt data' })
        }
    }

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
            // console.error('Decryption error:', error)
            // Return original if decryption fails (might not be encrypted)
            return encryptedText
        }
    }

    private processForStorage(config: any): any {
        const processed: any = {}
        for (const key in config) {
            const val = config[key]
            if (typeof val === 'string' && val.trim() !== '') {
                processed[key] = this.encrypt(val)
            } else {
                processed[key] = val
            }
        }
        return processed
    }

    private processForRetrieval(config: any): any {
        const processed: any = {}
        for (const key in config) {
            const val = config[key]
            if (typeof val === 'string' && val.includes(':')) {
                processed[key] = this.decrypt(val)
            } else {
                processed[key] = val
            }
        }
        return processed
    }

    async getAllTools(): Promise<AnalyticsTool[]> {
        const tools = await this.repository.findAllWithTemplate()
        return tools.map(tool => ({
            ...tool,
            configuration: this.processForRetrieval(tool.configuration)
        }))
    }

    async upsertTool(id: string | undefined, data: Partial<AnalyticsTool>): Promise<AnalyticsTool> {
        const payload = { ...data }
        if (payload.configuration) {
            payload.configuration = this.processForStorage(payload.configuration)
        }

        const tool = await this.repository.upsert(id, payload)
        return {
            ...tool,
            configuration: this.processForRetrieval(tool.configuration)
        }
    }

    async deleteTool(id: string): Promise<void> {
        await this.repository.delete(id)
    }
}
