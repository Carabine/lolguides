import { basename, extname } from 'path';
import { existsSync, mkdirSync, mkdir } from 'fs';
import { v4 as uuid } from 'uuid';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  AnyFilesFastifyInterceptor,
  FileFastifyInterceptor,
  FileFieldsFastifyInterceptor,
  FilesFastifyInterceptor,
  diskStorage
} from "fastify-file-interceptor";
const IMAGE_MAX_FILE_SIZE = 3 * 1024 * 1024;

// Multer configuration
export const multerConfigImage = {
  dest: './public/storage/images',
  limits: { fileSize: IMAGE_MAX_FILE_SIZE },
  fileFilter: (req: any, file: any, cb: any) => {
    Logger.debug({ file });
    if (file.mimetype.match(/\/(jpg|jpeg|png|svg\+xml)$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      )
    }
  },
  storage: diskStorage({
    // Destination storage path details
    destination: (req: any, file: any, cb: any) => {
      console.log("DEST FUNC")
      console.log(multerConfigImage.dest)
      const uploadPath = multerConfigImage.dest;
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    // File modification details
    filename: (req: any, file: any, cb: any) => {
      // Calling the callback passing the random name generated with the original extension name
      cb(null, `${uuid()}${extname(file.originalname)}`);
    },
  }),
}
