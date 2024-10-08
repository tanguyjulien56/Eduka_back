import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { profileCard } from 'src/interfaces/ProfileCard';
import { UserService } from './user.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async findProfilesByUserSchool(
    paginator: {
      skip: number;
      take: number;
    },
    userId: string,
  ): Promise<profileCard[]> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const userHasSchools = await this.prisma.userHasSchool.findMany({
      where: {
        user_id: user.id,
      },
    });

    const schoolIds = userHasSchools.map((entry) => entry.school_id);

    // Requête pour récupérer les profils des utilisateurs liés aux écoles
    const profiles = await this.prisma.profile.findMany({
      where: {
        user: {
          userHasSchool: {
            some: {
              school_id: {
                in: schoolIds,
              },
            },
          },
          roles: {
            some: {
              role: {
                name: 'PARENT',
              },
            },
          },
        },
      },
      skip: paginator.skip,
      take: paginator.take,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        photo: true, // Assure-toi que le champ `photo` existe dans ta table `profile`
      },
    });

    // Conversion des données vers le format `profileCard`
    return profiles.map((profile) => this.cardFormattedProfile(profile));
  }

  // Méthode pour formater le profil en `profileCard`
  private cardFormattedProfile(profile: {
    id: string;
    firstname: string;
    lastname: string;
    photo: string | null;
  }): profileCard {
    return {
      id: profile.id,
      firstname: profile.firstname,
      lastname: profile.lastname,
      profil_picture: profile.photo || '', // Si `photo` est null, renvoyer une chaîne vide
    };
  }
}
