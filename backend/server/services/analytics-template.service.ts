import { AnalyticsTemplateRepository } from '../repositories/analytics-template.repository'
import { AnalyticsTemplate } from '../repositories/analytics-template.repository'

export class AnalyticsTemplateService {
    private repository: AnalyticsTemplateRepository

    constructor() {
        this.repository = new AnalyticsTemplateRepository()
    }

    async getAllTemplates(activeOnly: boolean = true): Promise<AnalyticsTemplate[]> {
        if (activeOnly) {
            return this.repository.findAllActive()
        }
        // If we needed all including inactive, we'd add findAll() to repo. 
        // For now default to active.
        return this.repository.findAllActive()
    }
}
