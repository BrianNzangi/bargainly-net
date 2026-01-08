import { ApiTemplateRepository } from '../repositories/api-template.repository'
import type { ApiTemplate, CreateApiTemplateInput, UpdateApiTemplateInput } from '../shared/types'

export class ApiTemplateService {
    private repository: ApiTemplateRepository

    constructor() {
        this.repository = new ApiTemplateRepository()
    }

    async getAllTemplates(activeOnly: boolean = true): Promise<ApiTemplate[]> {
        return await this.repository.findAll(activeOnly)
    }

    async getTemplateById(id: string): Promise<ApiTemplate | null> {
        return await this.repository.findById(id)
    }

    async getTemplateByApiType(apiType: string): Promise<ApiTemplate | null> {
        return await this.repository.findByApiType(apiType)
    }

    async createTemplate(input: CreateApiTemplateInput): Promise<ApiTemplate> {
        // Validate that api_type is unique
        const existing = await this.repository.findByApiType(input.api_type)
        if (existing) {
            throw createError({
                statusCode: 400,
                statusMessage: `API template with type '${input.api_type}' already exists`
            })
        }

        return await this.repository.create(input)
    }

    async updateTemplate(id: string, input: UpdateApiTemplateInput): Promise<ApiTemplate> {
        const existing = await this.repository.findById(id)
        if (!existing) {
            throw createError({
                statusCode: 404,
                statusMessage: 'API template not found'
            })
        }

        return await this.repository.update(id, input)
    }

    async deleteTemplate(id: string): Promise<void> {
        const existing = await this.repository.findById(id)
        if (!existing) {
            throw createError({
                statusCode: 404,
                statusMessage: 'API template not found'
            })
        }

        await this.repository.delete(id)
    }

    async toggleTemplateActive(id: string): Promise<ApiTemplate> {
        const existing = await this.repository.findById(id)
        if (!existing) {
            throw createError({
                statusCode: 404,
                statusMessage: 'API template not found'
            })
        }

        return await this.repository.update(id, { is_active: !existing.is_active })
    }
}
