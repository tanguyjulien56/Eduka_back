import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Chemin où les fichiers seront stockés
        filename: (req, file, cb) => {
          // Générer un nom de fichier unique
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname); // Obtenir l'extension du fichier
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Renvoie le chemin du fichier uploadé
    return {
      imagePath: `uploads/${file.filename}`,
    };
  }
}
