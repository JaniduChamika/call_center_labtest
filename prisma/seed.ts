import { PrismaClient, UserRole } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
      console.log('🌱 Starting database seed...');

      // 1. Clean the database (Delete in reverse order to avoid foreign key errors)
      await prisma.appointments.deleteMany();
      await prisma.doctor_schedules.deleteMany();
      await prisma.doctor_hospital_affiliations.deleteMany();
      await prisma.doctors.deleteMany();
      await prisma.patients.deleteMany();
      await prisma.hospitals.deleteMany();
      await prisma.illness_specialization_map.deleteMany();
      await prisma.specializations.deleteMany();
      await prisma.call_center_user.deleteMany();

      console.log('🧹 Database cleaned');

      // 2. Create Specializations
      const specCardio = await prisma.specializations.create({ data: { name: 'Cardiology' } });
      const specDerma = await prisma.specializations.create({ data: { name: 'Dermatology' } });
      const specPeds = await prisma.specializations.create({ data: { name: 'Pediatrics' } });
      const specOrtho = await prisma.specializations.create({ data: { name: 'Orthopedics' } });
      const specGP = await prisma.specializations.create({ data: { name: 'General Physician (GP)' } });

      console.log('✅ Specializations created');

      // 3. Create Illness Map
      await prisma.illness_specialization_map.createMany({
            data: [
                  { illness_name: 'Chest Pain', specialization_id: specCardio.specialization_id },
                  { illness_name: 'High Blood Pressure', specialization_id: specCardio.specialization_id },
                  { illness_name: 'Skin Rash', specialization_id: specDerma.specialization_id },
                  { illness_name: 'Acne', specialization_id: specDerma.specialization_id },
                  { illness_name: 'Fever (Child)', specialization_id: specPeds.specialization_id },
                  { illness_name: 'Knee Pain', specialization_id: specOrtho.specialization_id },
                  { illness_name: 'Common Cold', specialization_id: specGP.specialization_id },
            ],
      });
      console.log('✅ Illnesses created');

      // 4. Create Hospitals (Using public_id)
      const hospNawaloka = await prisma.hospitals.create({
            data: {
                  name: 'Nawaloka Hospital',
                  city: 'Colombo',
                  address: '23, Deshamanya H K Dharmadasa Mw',
                  phone_number: '0115577111',
                  public_id: 'HOSP-001'
            },
      });
      const hospLanka = await prisma.hospitals.create({
            data: {
                  name: 'Lanka Hospitals',
                  city: 'Colombo',
                  address: '578 Elvitigala Mawatha',
                  phone_number: '0115430000',
                  public_id: 'HOSP-002'
            },
      });
      const hospKandy = await prisma.hospitals.create({
            data: {
                  name: 'Suwasewana Hospital',
                  city: 'Kandy',
                  address: '532 Peradeniya Rd',
                  phone_number: '0812222222',
                  public_id: 'HOSP-003'
            },
      });
      console.log('✅ Hospitals created');

      // 5. Create Doctors (Using public_id)
      const drSilva = await prisma.doctors.create({
            data: {
                  name: 'Dr. Anura Silva',
                  specialization_id: specCardio.specialization_id,
                  profile_description: 'Senior Cardiologist with 15 years experience.',
                  public_id: 'DOC-001',
                  consultant_fee: 2500.00
            },
      });
      const drPerera = await prisma.doctors.create({
            data: {
                  name: 'Dr. Kamini Perera',
                  specialization_id: specDerma.specialization_id,
                  profile_description: 'Specialist in cosmetic dermatology.',
                  public_id: 'DOC-002',
                  consultant_fee: 1800.00
            },
      });
      const drFernando = await prisma.doctors.create({
            data: {
                  name: 'Dr. Nalin Fernando',
                  specialization_id: specPeds.specialization_id,
                  profile_description: 'Consultant Pediatrician.',
                  public_id: 'DOC-003',
                  consultant_fee: 2000.00
            },
      });
      console.log('✅ Doctors created');

      // 6. Create Affiliations
      await prisma.doctor_hospital_affiliations.createMany({
            data: [
                  { doctor_id: drSilva.doctor_id, hospital_id: hospNawaloka.hospital_id },
                  { doctor_id: drSilva.doctor_id, hospital_id: hospLanka.hospital_id },
                  { doctor_id: drPerera.doctor_id, hospital_id: hospNawaloka.hospital_id },
                  { doctor_id: drFernando.doctor_id, hospital_id: hospKandy.hospital_id },
            ],
      });
      console.log('✅ Affiliations created');

      // 7. Create Schedules
      // Dr. Silva @ Nawaloka: Sundays 2PM - 5PM (UTC times used for storage)
      await prisma.doctor_schedules.create({
            data: {
                  doctor_id: drSilva.doctor_id,
                  hospital_id: hospNawaloka.hospital_id,
                  day_of_week: 0, // Sunday
                  start_time: new Date('1970-01-01T14:00:00Z'),
                  end_time: new Date('1970-01-01T17:00:00Z'),
            },
      });
      // Dr. Silva @ Lanka Hospitals: Mondays 9AM - 12PM
      await prisma.doctor_schedules.create({
            data: {
                  doctor_id: drSilva.doctor_id,
                  hospital_id: hospLanka.hospital_id,
                  day_of_week: 1, // Monday
                  start_time: new Date('1970-01-01T09:00:00Z'),
                  end_time: new Date('1970-01-01T12:00:00Z'),
            },
      });
      console.log('✅ Schedules created');

      // 8. Create call_center_user (Agents & Admin) - USING STRINGS FOR ROLES
      const passwordHash = await bcrypt.hash('password123', 10);

      await prisma.call_center_user.create({
            data: {
                  name: 'Call Center Agent 1',
                  email: 'agent@echannel.com',
                  password: passwordHash,
                  role: 'CALL_AGENT', // <-- String, matches your schema
                  status: 'active'
            },
      });
      await prisma.call_center_user.create({
            data: {
                  name: 'Call Center Super Admin',
                  email: 'superadmin@echannel.com',
                  password: passwordHash,
                  role: 'SUPER_ADMIN', // <-- String, matches your schema
                  status: 'active'
            },
      })
      await prisma.call_center_user.create({
            data: {
                  name: 'System Admin',
                  email: 'admin@echannel.com',
                  password: passwordHash,
                  role: 'ADMIN', // <-- String, matches your schema
                  status: 'active'
            },
      });

      console.log('✅ call_center_user created');
      console.log('   -> Agent: agent@echannel.com / password123');
      console.log('   -> Admin: admin@echannel.com / password123');

      // 9. Create Patients
      const patNimal = await prisma.patients.create({
            data: {
                  name: 'Nimal Perera',
                  phone_number: '+94771234567',
                  email: 'nimal.p@email.com',
                  nic: '851234567V'
            }
      });

      const patKamala = await prisma.patients.create({
            data: {
                  name: 'Kamala Silva',
                  phone_number: '+94719876543',
                  email: 'kamala.s@email.com',
                  nic: '905678123V'
            }
      });

      const patSunil = await prisma.patients.create({
            data: {
                  name: 'Sunil Jayasinghe',
                  phone_number: '+94765554444',
                  email: null, // Some patients might not have email
                  nic: '198805512345' // New NIC format
            }
      });
      console.log('✅ Patients created');

      // 10. Create Appointments

      // Calculate some dates
      const today = new Date();

      // Future date (next Sunday) for Dr. Silva
      const nextSunday = new Date();
      nextSunday.setDate(today.getDate() + (7 - today.getDay()) % 7);
      if (today.getDay() === 0 && today.getHours() >= 14) nextSunday.setDate(nextSunday.getDate() + 7);
      nextSunday.setHours(14, 30, 0, 0); // 2:30 PM

      const nextSundayEnd = new Date(nextSunday);
      nextSundayEnd.setMinutes(nextSunday.getMinutes() + 15);

      // Past date (last Monday) for Dr. Silva
      const lastMonday = new Date();
      lastMonday.setDate(today.getDate() - (today.getDay() + 6) % 7);
      lastMonday.setHours(9, 15, 0, 0); // 9:15 AM

      const lastMondayEnd = new Date(lastMonday);
      lastMondayEnd.setMinutes(lastMonday.getMinutes() + 15);

      // Appointment 1: Nimal Perera - Confirmed (Future)
      await prisma.appointments.create({
            data: {
                  public_id: 'APT-001',
                  patient_id: patNimal.patient_id,
                  doctor_id: drSilva.doctor_id,
                  hospital_id: hospNawaloka.hospital_id,
                  start_time: nextSunday,
                  end_time: nextSundayEnd,
                  status: 'confirmed',
                  payment_confirmation_code: 'PAY-888999',
                  payment_link: 'https://pay.gateway.lk/pay/expired',
            }
      });

      // Appointment 2: Kamala Silva - Pending Payment (Future)
      // Same day as Nimal, but later slot (2:45 PM)
      const nextSundayLater = new Date(nextSunday);
      nextSundayLater.setMinutes(nextSunday.getMinutes() + 15); // 2:45 PM
      const nextSundayLaterEnd = new Date(nextSundayLater);
      nextSundayLaterEnd.setMinutes(nextSundayLater.getMinutes() + 15);

      await prisma.appointments.create({
            data: {
                  public_id: 'APT-002',
                  patient_id: patKamala.patient_id,
                  doctor_id: drSilva.doctor_id,
                  hospital_id: hospNawaloka.hospital_id,
                  start_time: nextSundayLater,
                  end_time: nextSundayLaterEnd,
                  status: 'pending_payment',
                  payment_link: 'https://pay.gateway.lk/pay/active-link-123',
            }
      });

      // Appointment 3: Sunil - Completed (Past)
      await prisma.appointments.create({
            data: {
                  public_id: 'APT-003',
                  patient_id: patSunil.patient_id,
                  doctor_id: drSilva.doctor_id,
                  hospital_id: hospLanka.hospital_id,
                  start_time: lastMonday,
                  end_time: lastMondayEnd,
                  status: 'completed',
                  payment_confirmation_code: 'PAY-OLD-111',
            }
      });

      console.log('✅ Appointments created');

      console.log('🌱 Seeding completed successfully.');
}

main()
      .catch((e) => {
            console.error(e);
            process.exit(1);
      })
      .finally(async () => {
            await prisma.$disconnect();
      });