import { ProviderId } from '../../types';
import { IAIProviderAdapter } from './types';

class ProviderRegistryService {
  private adapters: Map<ProviderId, IAIProviderAdapter> = new Map();

  /**
   * Register a new or custom provider adapter.
   * New providers (e.g. Mistral, Cohere, Bedrock) plug in here dynamically
   * without requiring changes to UI or core application logic.
   */
  public registerAdapter(adapter: IAIProviderAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  public unregisterAdapter(providerId: ProviderId): void {
    this.adapters.delete(providerId);
  }

  public getAdapter(providerId: ProviderId): IAIProviderAdapter | undefined {
    return this.adapters.get(providerId);
  }

  public hasAdapter(providerId: ProviderId): boolean {
    return this.adapters.has(providerId);
  }

  public listRegisteredProviders(): ProviderId[] {
    return Array.from(this.adapters.keys());
  }
}

export const ProviderRegistry = new ProviderRegistryService();
