import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model, isValidObjectId } from 'mongoose';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {

  constructor(

    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ) { }
  
  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.userModel.create( createUserDto)
      return user;
    } catch (error) {
      if(error.code === 11000){
        throw new BadRequestException(`Ya existe en la Base de DAtos ${JSON.stringify(error.keyValue)}`)
      }
      console.log(error);
      throw new InternalServerErrorException(`Can't Create User -check server logs`)  

    }
  }
  async findAll() {
    try {
        // Busca y retorna todos los usuarios en la base de datos
        const users = await this.userModel.find();
        return users;
    } catch (error) {
        // Si se produce un error durante la búsqueda, maneja el error aquí
        console.error(error);
        throw error; // Puedes propagar el error o manejarlo según tu lógica de la aplicación
    }

  }
  

  async findOne(term: string) {
    let user: User;

    // Intenta buscar por ID si el término es un ObjectId válido
    if (!user && isValidObjectId(term)) {
        user = await this.userModel.findById(term);
    }
    
    // Si no se encontró el usuario por ID, lanza una excepción
    if (!user) {
        throw new NotFoundException(`User with id or no "${term}" not found`);
    }

    return user; // Retorna el usuario encontrado
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Busca el usuario por su ID
    const user = await this.findOne(id);

    // Actualiza el usuario con los datos proporcionados en updateUserDto
    await user.updateOne(updateUserDto);

    // Retorna un objeto que combina las propiedades del usuario antes y después de la actualización
    return { ...user.toJSON(), ...updateUserDto };
}

  async remove(id: string) {
    try {
      // Utiliza findOneAndDelete si necesitas obtener el documento antes de eliminarlo
      // const user = await this.userModel.findOneAndDelete({ _id: userId });
  
      // Utiliza deleteOne si solo necesitas eliminar el documento sin obtenerlo primero
      const result = await this.userModel.deleteOne({ _id: id });
  
      if (result.deletedCount === 0) {
        throw new Error(`User with id ${id} not found`);
      }
  
      return result; // Retorna el resultado de la operación de eliminación
    } catch (error) {
      // Manejo de errores aquí
      console.error(error);
      throw error; // Puedes propagar el error o manejarlo según tu lógica de la aplicación
    }
  }
}
