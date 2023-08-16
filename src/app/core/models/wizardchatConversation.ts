import { Model } from '../objects/model';

export class WizardChatEntry {
  entryType: 'USER' | 'WIZARD' | 'SYSTEM';
  role: 'ASSISTANT' | 'USER' | 'SYSTEM';
  content: string;
}

export class WizardChatConversation extends Model<WizardChatConversation> {
  entries: Array<WizardChatEntry>;
  context: Record<string, any>;
}
