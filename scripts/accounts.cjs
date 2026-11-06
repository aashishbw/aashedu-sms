require("dotenv/config");
const { PrismaClient, Role } = require("@prisma/client");
const { hash } = require("../lib/password.cjs");
const { PrismaPg } = require("@prisma/adapter-pg");
const db = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main() {
  if (process.argv.includes("--demo")) {
    if (process.env.NODE_ENV === "production" || !/^postgres(?:ql)?:\/\/[^@]+@(?:localhost|127\.0\.0\.1):\d+\/[^?]+/.test(process.env.DATABASE_URL ?? ""))
      throw new Error("Demo seeding requires a local non-production database.");
    for (const role of Object.values(Role)) {
      const email = role.toLowerCase() + "@demo.example";
      await db.user.upsert({where:{email},update:{},create:{email,name:role.replaceAll("_"," "),role,password:hash("Campus-demo-2026!") }});
    }
    await db.$transaction(async tx=>{
      const year=await tx.academicYear.upsert({where:{name:"Demo academic year"},update:{},create:{name:"Demo academic year",starts:new Date("2026-01-01"),ends:new Date("2026-12-31")}});
      const room=await tx.schoolClass.upsert({where:{name_yearId:{name:"Grade 8",yearId:year.id}},update:{},create:{name:"Grade 8",yearId:year.id}});
      const teacher=await tx.employee.upsert({where:{employeeNo:"DEMO-T01"},update:{},create:{name:"Alex Rivera",employeeNo:"DEMO-T01",jobTitle:"Mathematics teacher",joined:new Date("2024-01-10"),salary:"1500.00"}});
      const student=await tx.student.upsert({where:{admissionNo:"DEMO-001"},update:{},create:{name:"Maya Sharma",admissionNo:"DEMO-001",status:"Active"}});
      const subject=await tx.subject.upsert({where:{code:"MATH"},update:{},create:{name:"Mathematics",code:"MATH"}});
      const section=await tx.section.upsert({where:{name_classroomId:{name:"A",classroomId:room.id}},update:{},create:{name:"A",classroomId:room.id,capacity:35,teacherId:teacher.id}});
      await tx.teaching.upsert({where:{sectionId_subjectId:{sectionId:section.id,subjectId:subject.id}},update:{},create:{sectionId:section.id,subjectId:subject.id,teacherId:teacher.id}});
      await tx.enrollment.upsert({where:{studentId_sectionId:{studentId:student.id,sectionId:section.id}},update:{},create:{studentId:student.id,sectionId:section.id,rollNo:"01"}});
      await tx.user.update({where:{email:"teacher@demo.example"},data:{employeeId:teacher.id}});
      await tx.user.update({where:{email:"student@demo.example"},data:{studentId:student.id}});
      const parent=await tx.user.findUniqueOrThrow({where:{email:"parent@demo.example"}});
      await tx.guardianLink.upsert({where:{userId_studentId:{userId:parent.id,studentId:student.id}},update:{},create:{userId:parent.id,studentId:student.id}});
      const category=await tx.feeCategory.upsert({where:{name:"Tuition"},update:{},create:{name:"Tuition"}});
      const structure=await tx.feeStructure.upsert({where:{categoryId_classroomId:{categoryId:category.id,classroomId:room.id}},update:{},create:{categoryId:category.id,classroomId:room.id,amount:"100.10"}});
      await tx.invoice.upsert({where:{reference:"DEMO-INV-001"},update:{},create:{reference:"DEMO-INV-001",studentId:student.id,structureId:structure.id,amount:"100.10",discount:"0.10",due:new Date("2026-12-01")}});
    });
    return;
  }
  const { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 14 || ADMIN_PASSWORD.length > 256)
    throw new Error("Set ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD (14–256 characters).");
  await db.user.create({data:{email:ADMIN_EMAIL.trim().toLowerCase(),name:ADMIN_NAME,role:"SUPER_ADMIN",password:hash(ADMIN_PASSWORD)}});
}
main().catch(error=>{ console.error(error.message);process.exitCode=1; }).finally(()=>db.$disconnect());
