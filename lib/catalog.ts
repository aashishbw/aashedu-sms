export type Field = { name: string; type: string; optional?: boolean; target?: string };
export type Resource = { title: string; model: string; fields: Field[] };
export const catalog: Record<string, Resource> = {
  "students": {
    "title": "Students",
    "model": "student",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "admissionNo",
        "type": "text"
      },
      {
        "name": "email",
        "type": "text",
        "optional": true
      },
      {
        "name": "guardianName",
        "type": "text",
        "optional": true
      },
      {
        "name": "emergencyPhone",
        "type": "text",
        "optional": true
      },
      {
        "name": "status",
        "type": "text"
      }
    ]
  },
  "employees": {
    "title": "Teachers & staff",
    "model": "employee",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "employeeNo",
        "type": "text"
      },
      {
        "name": "jobTitle",
        "type": "text"
      },
      {
        "name": "email",
        "type": "text",
        "optional": true
      },
      {
        "name": "qualification",
        "type": "text",
        "optional": true
      },
      {
        "name": "joined",
        "type": "date"
      },
      {
        "name": "salary",
        "type": "money"
      }
    ]
  },
  "years": {
    "title": "Academic years",
    "model": "academicYear",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "starts",
        "type": "date"
      },
      {
        "name": "ends",
        "type": "date"
      }
    ]
  },
  "classes": {
    "title": "Classes",
    "model": "schoolClass",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "year",
        "type": "relation",
        "target": "years"
      }
    ]
  },
  "sections": {
    "title": "Sections",
    "model": "section",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "classroom",
        "type": "relation",
        "target": "classes"
      },
      {
        "name": "capacity",
        "type": "int"
      },
      {
        "name": "teacher",
        "type": "relation",
        "optional": true,
        "target": "employees"
      }
    ]
  },
  "subjects": {
    "title": "Subjects",
    "model": "subject",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "code",
        "type": "text"
      }
    ]
  },
  "teaching": {
    "title": "Teaching assignments",
    "model": "teaching",
    "fields": [
      {
        "name": "section",
        "type": "relation",
        "target": "sections"
      },
      {
        "name": "subject",
        "type": "relation",
        "target": "subjects"
      },
      {
        "name": "teacher",
        "type": "relation",
        "target": "employees"
      }
    ]
  },
  "enrollments": {
    "title": "Enrollments",
    "model": "enrollment",
    "fields": [
      {
        "name": "student",
        "type": "relation",
        "target": "students"
      },
      {
        "name": "section",
        "type": "relation",
        "target": "sections"
      },
      {
        "name": "rollNo",
        "type": "text"
      }
    ]
  },
  "timetable": {
    "title": "Timetable",
    "model": "period",
    "fields": [
      {
        "name": "teaching",
        "type": "relation",
        "target": "teaching"
      },
      {
        "name": "section",
        "type": "relation",
        "target": "sections"
      },
      {
        "name": "teacher",
        "type": "relation",
        "target": "employees"
      },
      {
        "name": "weekday",
        "type": "int"
      },
      {
        "name": "slot",
        "type": "int"
      },
      {
        "name": "room",
        "type": "text"
      }
    ]
  },
  "attendance": {
    "title": "Student attendance",
    "model": "attendance",
    "fields": [
      {
        "name": "enrollment",
        "type": "relation",
        "target": "enrollments"
      },
      {
        "name": "day",
        "type": "date"
      },
      {
        "name": "status",
        "type": "text"
      }
    ]
  },
  "staff-attendance": {
    "title": "Staff attendance",
    "model": "staffAttendance",
    "fields": [
      {
        "name": "employee",
        "type": "relation",
        "target": "employees"
      },
      {
        "name": "day",
        "type": "date"
      },
      {
        "name": "status",
        "type": "text"
      }
    ]
  },
  "fee-categories": {
    "title": "Fee categories",
    "model": "feeCategory",
    "fields": [
      {
        "name": "name",
        "type": "text"
      }
    ]
  },
  "fee-structures": {
    "title": "Fee structures",
    "model": "feeStructure",
    "fields": [
      {
        "name": "category",
        "type": "relation",
        "target": "fee-categories"
      },
      {
        "name": "classroom",
        "type": "relation",
        "target": "classes"
      },
      {
        "name": "amount",
        "type": "money"
      }
    ]
  },
  "fees": {
    "title": "Student invoices",
    "model": "invoice",
    "fields": [
      {
        "name": "reference",
        "type": "text"
      },
      {
        "name": "student",
        "type": "relation",
        "target": "students"
      },
      {
        "name": "structure",
        "type": "relation",
        "target": "fee-structures"
      },
      {
        "name": "amount",
        "type": "money"
      },
      {
        "name": "discount",
        "type": "money"
      },
      {
        "name": "due",
        "type": "date"
      }
    ]
  },
  "payments": {
    "title": "Payments",
    "model": "payment",
    "fields": [
      {
        "name": "reference",
        "type": "text"
      },
      {
        "name": "invoice",
        "type": "relation",
        "target": "fees"
      },
      {
        "name": "amount",
        "type": "money"
      },
      {
        "name": "day",
        "type": "date"
      }
    ]
  },
  "exams": {
    "title": "Examinations",
    "model": "exam",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "classroom",
        "type": "relation",
        "target": "classes"
      },
      {
        "name": "day",
        "type": "date"
      },
      {
        "name": "type",
        "type": "text"
      }
    ]
  },
  "exam-subjects": {
    "title": "Exam subjects",
    "model": "examSubject",
    "fields": [
      {
        "name": "exam",
        "type": "relation",
        "target": "exams"
      },
      {
        "name": "subject",
        "type": "relation",
        "target": "subjects"
      },
      {
        "name": "fullMarks",
        "type": "int"
      },
      {
        "name": "passMarks",
        "type": "int"
      }
    ]
  },
  "marks": {
    "title": "Marks",
    "model": "mark",
    "fields": [
      {
        "name": "paper",
        "type": "relation",
        "target": "exam-subjects"
      },
      {
        "name": "enrollment",
        "type": "relation",
        "target": "enrollments"
      },
      {
        "name": "score",
        "type": "int"
      }
    ]
  },
  "grading": {
    "title": "Grading scale",
    "model": "grade",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "minimum",
        "type": "int"
      }
    ]
  },
  "homework": {
    "title": "Homework",
    "model": "assignment",
    "fields": [
      {
        "name": "title",
        "type": "text"
      },
      {
        "name": "teaching",
        "type": "relation",
        "target": "teaching"
      },
      {
        "name": "description",
        "type": "text"
      },
      {
        "name": "due",
        "type": "date"
      }
    ]
  },
  "books": {
    "title": "Library catalog",
    "model": "book",
    "fields": [
      {
        "name": "title",
        "type": "text"
      },
      {
        "name": "code",
        "type": "text"
      },
      {
        "name": "isbn",
        "type": "text",
        "optional": true
      },
      {
        "name": "author",
        "type": "text"
      },
      {
        "name": "category",
        "type": "text"
      },
      {
        "name": "copies",
        "type": "int"
      },
      {
        "name": "fine",
        "type": "money"
      }
    ]
  },
  "loans": {
    "title": "Book loans",
    "model": "loan",
    "fields": [
      {
        "name": "book",
        "type": "relation",
        "target": "books"
      },
      {
        "name": "student",
        "type": "relation",
        "optional": true,
        "target": "students"
      },
      {
        "name": "employee",
        "type": "relation",
        "optional": true,
        "target": "employees"
      },
      {
        "name": "due",
        "type": "date"
      },
      {
        "name": "returned",
        "type": "date",
        "optional": true
      }
    ]
  },
  "vehicles": {
    "title": "Vehicles",
    "model": "vehicle",
    "fields": [
      {
        "name": "registration",
        "type": "text"
      },
      {
        "name": "driver",
        "type": "text"
      },
      {
        "name": "capacity",
        "type": "int"
      }
    ]
  },
  "transport": {
    "title": "Transport routes",
    "model": "route",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "vehicle",
        "type": "relation",
        "target": "vehicles"
      },
      {
        "name": "pickup",
        "type": "text"
      },
      {
        "name": "dropoff",
        "type": "text"
      },
      {
        "name": "fee",
        "type": "money"
      }
    ]
  },
  "riders": {
    "title": "Transport riders",
    "model": "rider",
    "fields": [
      {
        "name": "route",
        "type": "relation",
        "target": "transport"
      },
      {
        "name": "student",
        "type": "relation",
        "target": "students"
      }
    ]
  },
  "communication": {
    "title": "Announcements",
    "model": "announcement",
    "fields": [
      {
        "name": "title",
        "type": "text"
      },
      {
        "name": "body",
        "type": "text"
      },
      {
        "name": "section",
        "type": "relation",
        "optional": true,
        "target": "sections"
      }
    ]
  },
  "leave": {
    "title": "Leave requests",
    "model": "leaveRequest",
    "fields": [
      {
        "name": "student",
        "type": "relation",
        "optional": true,
        "target": "students"
      },
      {
        "name": "employee",
        "type": "relation",
        "optional": true,
        "target": "employees"
      },
      {
        "name": "starts",
        "type": "date"
      },
      {
        "name": "ends",
        "type": "date"
      },
      {
        "name": "reason",
        "type": "text"
      },
      {
        "name": "status",
        "type": "text"
      }
    ]
  },
  "settings": {
    "title": "School settings",
    "model": "schoolSetting",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "address",
        "type": "text"
      },
      {
        "name": "email",
        "type": "text"
      },
      {
        "name": "website",
        "type": "text",
        "optional": true
      },
      {
        "name": "currency",
        "type": "text"
      },
      {
        "name": "timezone",
        "type": "text"
      }
    ]
  }
};
export const fieldKey = (field: Field) => field.target ? field.name + "Id" : field.name;
export const label = (name: string) => name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, c => c.toUpperCase());

catalog.payroll = { title:"Payroll Management", model:"payroll", fields:[
  {name:"employee",type:"relation",target:"employees"}, {name:"period",type:"date"},
  {name:"base",type:"money",optional:true}, {name:"allowances",type:"money"},
  {name:"deductions",type:"money"}, {name:"status",type:"text"}
]};
