import { Model } from '../objects/model';

export class CommunityCategory extends Model<CommunityCategory> {
    name: string;
    description?: string;
}

export class CommunityCategoryInput {
    name: string;
    description?: string;
}