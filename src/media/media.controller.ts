import {
  Controller,
  Post,
  UploadedFile, UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  AnyFilesFastifyInterceptor,
  FileFastifyInterceptor,
  FileFieldsFastifyInterceptor,
  FilesFastifyInterceptor,
  diskStorage
} from "fastify-file-interceptor";
import {
  multerConfigImage
} from "../multer.config";
import {FileDecorator} from "./decorators/file.decorator";
import {AdminGuard} from "../auth/guards/admin.guard";

@Controller('api/media')
export class MediaController {
  constructor() { }

  @Post('/upload/image')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileFastifyInterceptor('file', multerConfigImage))
  uploadImage(@UploadedFile() file: any) {
    console.log("file")
    console.log(file)
    return {path: 'public/storage/images/' + file.filename}
  }

//   @Post('/upload/image')
//   uploadImage(@FileDecorator() file: any) {
//     console.log("file")
//     console.log(file)
//     // if (!file) {
//     //   throw new Error("no file")
//     // }
//     // if (file.mimetype.split('/')[0] !== 'image') {
//     //   throw ({ message: 'wrong file type' })
//     // }
//     // return file.path
//   }
}
