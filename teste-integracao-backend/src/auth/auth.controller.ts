import { Body, Controller, Post, Get, Res, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SigninPatientDto } from './dto/signin-patient.dto';
import { SigninDoctorDto } from './dto/signin-doctor.dto';
import { SignupPatientDto } from './dto/signup-patient.dto';
import { SignupDoctorDto } from './dto/signup-doctor.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { FastifyReply } from 'fastify';
import '@fastify/cookie';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('/patient/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Cadastro de paciente',
    description: 'Cria uma nova conta de paciente no sistema'
  })
  @ApiBody({ type: SignupPatientDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Paciente cadastrado com sucesso',
    schema: {
      example: {
        message: 'Patient account created successfully',
        user: {
          id: 'clx123456789',
          name: 'João Silva',
          email: 'joao.silva@email.com'
        },
        profile: {
          id: 'clx987654321',
          accountId: 'clx456789123',
          approved: false,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async signupPatient(
    @Body() signupPatientDto: SignupPatientDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    try {
      const result = await this.authService.signupPatient(signupPatientDto);
      
      // Set httpOnly cookie with JWT token (usando reply.raw para acessar o Fastify nativo)
      reply.setCookie('accessToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds (não milissegundos!)
        path: '/',
      });

      return {
        message: 'Patient account created successfully',
        user: result.user,
        profile: result.profile,
      };
    } catch (error) {
      console.error('Error in signupPatient controller:', error);
      throw error;
    }
  }

  @Post('/doctor/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Cadastro de médico',
    description: 'Cria uma nova conta de médico no sistema (não aprovada por padrão)'
  })
  @ApiBody({ type: SignupDoctorDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Médico cadastrado com sucesso',
    schema: {
      example: {
        message: 'Doctor account created successfully',
        user: {
          id: 'clx123456789',
          name: 'Dr. Maria Santos',
          email: 'maria.santos@email.com'
        },
        profile: {
          id: 'clx987654321',
          accountId: 'clx456789123',
          approved: false,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async signupDoctor(
    @Body() signupDoctorDto: SignupDoctorDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.signupDoctor(signupDoctorDto);
    
    // Set httpOnly cookie with JWT token
    reply.setCookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return {
      message: 'Doctor account created successfully',
      user: result.user,
      profile: result.profile,
    };
  }

  @Post('/patient/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login de paciente',
    description: 'Autentica um paciente e retorna dados do usuário e profile'
  })
  @ApiBody({ type: SigninPatientDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        message: 'Patient signed in successfully',
        user: {
          id: 'clx123456789',
          name: 'João Silva',
          email: 'joao.silva@email.com'
        },
        profile: {
          id: 'clx987654321',
          accountId: 'clx456789123',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async signinPatient(
    @Body() signinPatientDto: SigninPatientDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.signinPatient(signinPatientDto);
    
    // Set httpOnly cookie with JWT token
    reply.setCookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return {
      message: 'Patient signed in successfully',
      user: result.user,
      profile: result.profile,
    };
  }

  @Post('/doctor/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login de médico',
    description: 'Autentica um médico e retorna dados do usuário e profile'
  })
  @ApiBody({ type: SigninDoctorDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        message: 'Doctor signed in successfully',
        user: {
          id: 'clx123456789',
          name: 'Dr. Maria Santos',
          email: 'maria.santos@email.com'
        },
        profile: {
          id: 'clx987654321',
          accountId: 'clx456789123',
          approved: true,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async signinDoctor(
    @Body() signinDoctorDto: SigninDoctorDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.signinDoctor(signinDoctorDto);
    
    // Set httpOnly cookie with JWT token
    reply.setCookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return {
      message: 'Doctor signed in successfully',
      user: result.user,
      profile: result.profile,
    };
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verificar autenticação',
    description: 'Retorna os dados do usuário autenticado se o token for válido'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário autenticado',
    schema: {
      example: {
        authenticated: true,
        user: {
          id: 'clx123456789',
          email: 'joao.silva@email.com',
          accountType: 'CLIENT',
          accountId: 'clx456789123'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autenticado ou token inválido' })
  async getMe(@CurrentUser() user: any) {
    // Buscar o profileId baseado no accountId
    let profileId: string | null = null;
    
    if (user.accountType === 'PROFESSIONAL') {
      const doctorProfile = await this.prisma.doctorProfile.findUnique({
        where: { accountId: user.accountId },
        select: { id: true },
      });
      profileId = doctorProfile?.id || null;
    } else if (user.accountType === 'CLIENT') {
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { accountId: user.accountId },
        select: { id: true },
      });
      profileId = patientProfile?.id || null;
    }
    
    return {
      authenticated: true,
      user: {
        id: user.sub,
        email: user.email,
        accountType: user.accountType,
        accountId: user.accountId,
        profileId, // ID do DoctorProfile ou PatientProfile
      },
    };
  }

  @Post('/signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Logout',
    description: 'Remove o cookie de autenticação e faz logout do usuário'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout realizado com sucesso',
    schema: {
      example: {
        message: 'Signed out successfully'
      }
    }
  })
  async signout(@Res({ passthrough: true }) reply: FastifyReply) {
    // Clear the httpOnly cookie
    reply.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return {
      message: 'Signed out successfully',
    };
  }
}