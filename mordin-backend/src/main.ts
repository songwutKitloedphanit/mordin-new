import { join } from 'path';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // app.useGlobalInterceptors(
  //   new ClassSerializerInterceptor(app.get(Reflector)),
  //   new TransformResponseInterceptor(),
  // );

  // app.useGlobalFilters(new AllExceptionsFilter());

  // app.enableCors({
  //   origin: 'http://localhost:5173',
  //   credentials: true,
  // });

  const config = new DocumentBuilder()
    .setTitle('Mordin API')
    .setDescription('Mordin API description')
    .setVersion('1.0')
    .addTag('mordin')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    })
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
