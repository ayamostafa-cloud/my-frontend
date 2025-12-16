import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from '../models/employee-profile.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmployeeStatus, SystemRole } from '../enums/employee-profile.enums';
import { RegisterDto } from '../dto/register.dto';
import { ADMIN_ROLES } from '../../common/constants/role-groups';
@Injectable()
export class AuthService {
    employeeSystemRoleModel: any;
  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<EmployeeProfileDocument>,
    private readonly jwtService: JwtService,
  ) {}

 async login(dto: { employeeNumber: string; password: string }) {
  const employee = await this.employeeModel.findOne({
    employeeNumber: dto.employeeNumber,
  });
  if (!employee) throw new NotFoundException("Employee not found");

  const isMatch = await bcrypt.compare(dto.password, employee.password as string);
  if (!isMatch) throw new UnauthorizedException("Invalid credentials");

  let role: SystemRole;
  const n = dto.employeeNumber.toUpperCase();

  if (n.startsWith("HRADM")) role = SystemRole.HR_ADMIN;
  else if (n.startsWith("HRM") || n.startsWith("HRMAN")) role = SystemRole.HR_MANAGER;
  else if (n.startsWith("HRE")) role = SystemRole.HR_EMPLOYEE;
  else if (n.startsWith("DH")) role = SystemRole.DEPARTMENT_HEAD;
  else if (n.startsWith("DEPT")) role = SystemRole.DEPARTMENT_EMPLOYEE;
  else if (n.startsWith("PAYM")) role = SystemRole.PAYROLL_MANAGER;
  else if (n.startsWith("PAYS")) role = SystemRole.PAYROLL_SPECIALIST;
  else if (n.startsWith("SYS")) role = SystemRole.SYSTEM_ADMIN;
  else if (n.startsWith("REC")) role = SystemRole.RECRUITER;
  else if (n.startsWith("FIN")) role = SystemRole.FINANCE_STAFF;
  else role = SystemRole.DEPARTMENT_EMPLOYEE;

  const payload = {
    id: employee._id.toString(),
    username: employee.firstName + " " + employee.lastName,
    role,
  };

  const token = await this.jwtService.signAsync(payload);

  return {
    access_token: token,
    payload,
    isAdmin: ADMIN_ROLES.includes(role), // ✅ IMPORTANT
  };
}

  
async register(dto: RegisterDto) {

  const exists = await this.employeeModel.findOne({
    employeeNumber: dto.employeeNumber,
  });
  if (exists)
    throw new BadRequestException("Employee number already exists ❌");

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const newEmployee = new this.employeeModel({
    employeeNumber: dto.employeeNumber,
    password: hashedPassword,
    firstName: dto.firstName,
    lastName: dto.lastName,
    nationalId: dto.nationalId,
    dateOfHire: new Date(dto.dateOfHire),
    address: dto.address,
    systemRole: dto.role,        // ✅ correct
    status: EmployeeStatus.ACTIVE,
  });

  return newEmployee.save();
}

}
