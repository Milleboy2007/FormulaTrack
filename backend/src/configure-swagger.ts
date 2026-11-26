    import { INestApplication } from '@nestjs/common';
    import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

    export function configureSwagger(app: INestApplication): void {
      const config = new DocumentBuilder()
        .setTitle('FormulaTrack Api')
        .setDescription(
          "API REST pour l'application de FormulaTrack.",
        )
        .setVersion('1.0.0')
        .addTag('Pilot', 'Gestion des pilot')
        .addTag('Race', 'Gestion des course')
        .addTag('Track', 'Gestion des circuits')
        .addTag('User', 'Gestion des utilisateur')
        .build();

      const documentFactory = () =>
        SwaggerModule.createDocument(app, config);

      SwaggerModule.setup('docs', app, documentFactory, {
        jsonDocumentUrl: 'docs/openapi.json',
        customSiteTitle: 'FormulaTrack Api - Documentation',
      });
    }