import {HttpAdapterHost, NestFactory} from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {ConfigService} from "./config/config.service";
import { AllExceptionsFilter } from './all-exceptions.filter';
import multipart from "@fastify/multipart";
import { NotFoundExceptionFilter } from './not-found-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  console.log(1)
  console.log(process.env.NODE_ENV)
  console.log(2)

  console.log(process.env.NODE_ENV)
  const config = app.get<ConfigService>(ConfigService);

  await app.register(multipart);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalFilters(new NotFoundExceptionFilter());


  app.enableCors({
    credentials: true,
    origin: true,
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Api-Key"],
    methods: ["GET", "POST", "DELETE", "PATCH"]
  });

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/'
  });

  app.setViewEngine({
    engine: {
      handlebars: require('ejs'),
    },
    templates: join(__dirname, '..', 'views'),
  });

  await app.listen(config.get('PORT'), () => {
    console.log(`App started on port ${config.get('PORT')}`)
    console.log(JSON.stringify(config.list()));
  });
}
bootstrap();