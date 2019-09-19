import { ModuleMetadata } from '@nestjs/common/interfaces';

export function extractModuleMetadata(options: ModuleMetadata & any): ModuleMetadata {
  const { controllers, exports, imports, providers } = options;
  return {
    controllers,
    exports,
    imports,
    providers,
  };
}
