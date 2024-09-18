import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { existsSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

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
    if (!file) {
      throw new Error('No file uploaded');
    }
    console.log(file);
    return { filePath: `/uploads/${file.filename}` };
  }
  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    // Utiliser le chemin correct pour le dossier 'uploads' après la compilation
    const filePath = join(__dirname, '..', 'uploads', filename);

    console.log('File path:', filePath); // Debugging statement

    // Vérifie si le fichier existe
    if (existsSync(filePath)) {
      return res.sendFile(filePath); // Envoie le fichier en réponse
    } else {
      return res.status(404).json({ message: 'File not found' });
    }
  }
}
