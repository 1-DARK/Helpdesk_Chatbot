import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ============ RATE LIMITING (In-Memory) ============
// Limits: 20 requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  return false;
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ============ RESPONSE CACHING ============
// Cache common FAQ responses for 1 hour
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const responseCache = new Map<string, { response: string; expiry: number }>();

// Common question patterns and their cached responses
const CACHED_RESPONSES: Record<string, string> = {
  "fees": `**Fee Structure at JUET Guna**

For detailed fee structure of different programmes offered by the university, please visit: https://www.juet.ac.in/jaypee/admission.php

**Additional Information:**
- No capitation fees or management quota
- 30-35% tuition fee concession for defence quota students
- No sibling discount available
- Education loan documents provided by the university

For specific programme fees, contact the Admission Cell at 1800-121-884444.`,

  "location": `**JUET Guna Location**

JUET Guna is located at **Raghogarh in Guna district of Madhya Pradesh**.

**Connectivity:**
- Well connected by Train and Bus
- Located on Mumbai - Agra National Highway
- Nearest airport: Bhopal

**Address:** AB Road, Raghogarh, Guna, Madhya Pradesh - 473226`,

  "placements": `**Placements at JUET Guna**

JUET has excellent placement records with leading companies visiting the campus.

**Key Highlights:**
- Strong industry connections
- Pre-placement training and workshops
- Internship opportunities

For detailed placement statistics and recruiter information, please visit the official JUET website or contact the Training & Placement Cell.

**Contact:** 1800-121-884444`,

  "hostel": `**Hostel Facilities at JUET Guna**

**Boys Hostel:**
- 21 blocks with capacity for 1830 students
- Rooms equipped with beds, mattresses, study tables, almirahs, wardrobes
- Lights, fans, Internet connectivity
- Centralized air cooling

**Girls Hostel:**
- Capacity for around 425 students
- Separate sporting & messing facility
- Same room amenities as boys hostel

All hostels have 24/7 security and WiFi connectivity.`,

  "admission": `**Admission at JUET Guna**

**B.Tech Admission:**
- Through JEE Main score/All India Rank OR
- Merit basis on 10+2 marks

**M.Tech Admission:**
- GATE qualified (exempted from entrance test) OR
- PGET (Post Graduate Entrance Test) at JUET

**PhD Admission:**
- PhD entrance test + interview
- NET/SLET/GATE qualified exempted from written test

**More Info:** https://www.juet.ac.in/jaypee/admission.php
**Helpline:** 1800-121-884444`,

  "ranking": `**JUET Guna Rankings & Recognition**

- **NAAC:** Grade A+ (2023)
- **Career 360:** AAA+ Rating (2023 & 2025)
- **THE World University Rankings 2025:** 501-600 band worldwide
- **UGC Approved:** Yes, under section 2(f) of UGC Act, 1956
- Member of Association of Universities

JUET is the first state private university in Madhya Pradesh, established in 2010.`,

  "cse": `**CSE Programs at JUET Guna**

**Available Specializations:**
- Computer Science and Engineering (Core)
- CSE (Artificial Intelligence & Machine Learning)
- CSE (Data Science)
- CSE (Cyber Security)

**Duration:** 4 years (8 semesters)

**Core Subjects:** Programming, Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks

**Career Prospects:** Software Engineer, Data Scientist, AI/ML Engineer, Cyber Security Analyst, and more.

For detailed comparison of CSE streams, ask me about specific specializations!`
};

function getCacheKey(message: string): string | null {
  const lower = message.toLowerCase().trim();
  
  if (lower.includes("fee") || lower.includes("cost") || lower.includes("price") || lower.includes("payment")) {
    return "fees";
  }
  if (lower.includes("location") || lower.includes("where") || lower.includes("address") || lower.includes("situated")) {
    return "location";
  }
  if (lower.includes("placement") || lower.includes("job") || lower.includes("recruit") || lower.includes("package")) {
    return "placements";
  }
  if (lower.includes("hostel") || lower.includes("accommodation") || lower.includes("room") || lower.includes("stay")) {
    return "hostel";
  }
  if (lower.includes("admission") || lower.includes("apply") || lower.includes("enroll") || lower.includes("join")) {
    return "admission";
  }
  if (lower.includes("ranking") || lower.includes("naac") || lower.includes("ugc") || lower.includes("recognition") || lower.includes("accredit")) {
    return "ranking";
  }
  if ((lower.includes("cse") || lower.includes("computer science")) && !lower.includes("ai") && !lower.includes("ml") && !lower.includes("data") && !lower.includes("cyber")) {
    return "cse";
  }
  
  return null;
}

function createSSEResponse(text: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      // Send the cached response as a single SSE event
      const data = JSON.stringify({
        choices: [{ delta: { content: text } }]
      });
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });
}

const JUET_KNOWLEDGE = `
JUET GUNA COMPREHENSIVE FAQ DATABASE

=== GENERAL INFORMATION ===

Q: Where is Jaypee University of Engineering and Technology (JUET) Guna located?
A: JUET Guna is located at Raghogarh in Guna district of Madhya Pradesh. It is well connected with Train, Bus through Mumbai - Agra National Highway and nearest airport at Bhopal.

Q: Is JUET Guna private or government?
A: Jaypee University of Engineering & Technology (JUET), Guna is the first state private university in Madhya Pradesh. It has been established vide Government of Madhya Pradesh gazette extra ordinary No.3 of 2010 dated 29th April 2010 as a private university in the State of Madhya Pradesh under the provisions of MP Niji Vishwavidyalaya Adhiniyam 2007.

Q: What are the University Rankings and Recognition?
A: JUET is accredited with Grade A+ by NAAC in 2023, rated AAA+ in 2023 & 2025 by Career 360 and ranked 501-600 band worldwide in the Times Higher Education World University Rankings 2025.

Q: Is JUET Guna UGC approved?
A: Yes, JUET Guna is UGC approved. The university has been notified by the UGC under section 2(f) of the UGC Act, 1956 and is a member of Association of Universities.

Q: Is the Degree awarded by JUET recognized in India and Abroad?
A: Yes.

Q: What is unique about JUET, Guna?
A: The unique thing about JUET is that the number of students is very less compared to other private colleges so there is not much rush. A mentor is assigned to each student for assisting and monitoring their all round development. It also provides better placement than other private universities.

=== PROGRAMMES OFFERED ===

Diploma Programs:
- Civil Engineering
- Mechanical Engineering

Undergraduate (B.Tech.) Programs:
- BBA
- Chemical Engineering
- Civil Engineering
- Computer Science and Engineering
- Computer Science and Engineering (AI & ML)
- Computer Science and Engineering (Data Science)
- Computer Science and Engineering (Cyber Security)
- Electronics & Communication Engineering
- Electronics Engineering (VLSI Design & Technology)
- Mechanical Engineering
- Mechanical & Mechatronics Engineering (Additive Manufacturing)

Postgraduate (M.Sc.) Programs:
- Chemistry
- Mathematics
- Physics

Postgraduate (M.Tech.) Programs:
- Chemical Engineering
- Civil Engineering (Environmental Engineering)
- Civil Engineering (Construction Management)
- Civil Engineering (Structural Engineering)
- Computer Science and Engineering
- Electronics & Communication Engineering
- Mechanical Engineering (Manufacturing Technology)

Ph.D. Programs:
- Chemical Engineering
- Civil Engineering
- Computer Science and Engineering
- Electronics & Communication Engineering
- Mechanical Engineering
- Chemistry
- Humanities & Social Sciences
- Physics
- Mathematics

=== ADMISSION PROCEDURES ===

Q: What is the admission procedure for BBA programme?
A: Candidate should have passed or appeared in 10+2 examination or equivalent from a recognized educational board.

Q: What is the admission procedure for B.Tech. programme?
A: The admission process is either on the basis of merit or scores in 10+2 or through JEE Main score/All India Rank.

Q: Can I get admission in B.Tech. without appearing for JEE Main?
A: Yes, students can get admission in B.Tech on the basis of merit in 12th.

Q: What is the admission procedure for B.Tech. Lateral Entry programme?
A: Passed Diploma examination / B.Tech. 1st Year / BSc for admission through B.Tech. Lateral entry in 2nd year in the relevant branch.

Q: What is the admission procedure for M.Tech. programme?
A: Candidates should have passed BE/BTech examination with 60% marks or 6.0 CGPA on 10 point scale in the relevant discipline. Admission will be based on the PGET (Post Graduate Entrance Test) conducted at JUET, Guna. GATE qualified candidates are exempted from appearing in the PGET.

Q: What is PGET at JUET Guna?
A: PGET is an acronym for Post Graduate Entrance Test conducted by Jaypee University of Engineering and Technology for M.Tech. admissions.

Q: What is the admission procedure for Ph.D. programme?
A: PG degree with 55% (50% for SC/ST) marks from a recognized University/Institution in the relevant subject. Admission will be based on the PhD entrance test followed by interview conducted at JUET, Guna. NET/SLET/GATE qualified candidates are exempted from appearing in the PhD Entrance test but have to appear in the interview.

Q: How can I get more information about Admissions?
A: To get detailed information about admission procedure, fee structure etc., please visit admission page of University website https://www.juet.ac.in/jaypee/admission.php

=== DEFENCE QUOTA & FEES ===

Q: Does the University have a defence quota in admission?
A: Yes. 10% seats are reserved for B.Tech. programmes for the wards of serving and retired Armed & Paramilitary forces.

Q: Does JUET provide a concession for students admitted under defence quota?
A: Yes. 35% concession in Tuition fee of B.Tech. programme for the wards or war widows and personnel killed in action and 30% concession in Tuition Fee for the wards of serving and retired Armed and Paramilitary forces personnel.

Q: Is there any Capitation fees/Management quota for admission?
A: No. There is no Capitation fees/Management quota for admission.

Q: What is the fee structure for different programs in JUET?
A: For fee structure of different programmes offered by the university, visit website of JUET https://www.juet.ac.in/jaypee/admission.php

Q: Does JUET have a tie up with banks for Education Loan facility?
A: No, however, required documents needed by banks for the education loan are provided by the University to the students.

Q: Is there any fee discount for sibling?
A: No.

Q: Is there any NRI Quota?
A: Yes, there is NRI/NRI Sponsored category.

=== INFRASTRUCTURE & FACILITIES ===

Q: What is the Infrastructure available at JUET?
A: JUET has a state-of-the-art fully networked and environment conditioned infrastructure having Smart lecture theatres, Class rooms, well equipped laboratories and IT infrastructure with Wifi facility and a Multipurpose hall with seating capacity approx. 2000. The Library or Learning Resource Centre (LRC) is well-stocked with Indian and International books, E-Journals, printed Journals/magazines covering all areas of Engineering, Management and Science.

Q: Does JUET Guna provide Hostel facilities?
A: Yes, the university has separate hostel facilities for boys and girls. Presently, there are 21 blocks of boy's hostels having the capacity to accommodate 1830 students. The girls hostel is having the capacity to accommodate around 425 inmates with its own sporting & messing facility. The rooms are equipped with beds, mattresses, study tables, almirahs, wardrobes, lights, fans and Internet connectivity and a centralized air cooling.

Q: What Sports facilities are available?
A: The university offers state-of-the-art sports facilities for Cricket, Football, Basketball, Volleyball, badminton etc. promoting physical fitness, teamwork, and overall well-being.

Q: How is the JUET campus equipped?
A: The JUET campus is equipped with cutting-edge technology, comfortable hostels, and dynamic spaces for academics, sports, and recreation. Additionally, there are eco-friendly initiatives for sustainable living.

Q: What is the library like at JUET?
A: The university library commonly known as Learning Resource Center (LRC) have an extensive collection of textbooks, journals, and digital resources to support academic pursuits.

Q: Is laptop provided by the University?
A: Laptop is not provided by the University. However, students are advised to bring their own laptops.

=== SCHOLARSHIPS ===

Q: Are scholarships offered at JUET Guna?
A: Yes, scholarships are offered at JUET Guna. Some of them are:
- Post Matric Scholarships for SC/ST and OBC students of Madhya Pradesh
- Chief Minister Meritorious Scholarship Scheme for the Students of Madhya Pradesh
- Scholarship for minority category students
- Scholarship provided by other state students by their state government
- Bihar Student Credit Card Scheme for the Students of Bihar
- Corporate Scholarship

=== CAMPUS LIFE & COLLABORATIONS ===

Q: What is the campus life like at JUET Guna?
A: Life at JUET, Guna is a balanced mix of academics, exploration, and community, offering ample opportunities for students to engage in learning, leadership, and social activities.

Q: Does JUET Guna have collaborations with other universities/institutions?
A: Yes, JUET Guna has various collaborations. The university has collaborated with other universities/institutions such as the University of Florida, IOWA State University of Science & Technology - USA, ICT Academy-IIITDM Jabalpur, JIIT Noida, NIT Uttarakhand, VLSI Society of India (VSI), JILIT Ghaziabad, JPVL New Delhi, KFCL.

Q: Is inter college transfer permissible between Jaypee Universities?
A: No, candidates cannot take transfers within Jaypee Universities.

=== DOCUMENTS REQUIRED ===

Documents Required for UG/PG Program:
| Document | Photocopies | Original |
| 10th Marksheet | Yes | - |
| 12th Marksheet | Yes | Verified with original |
| UG Degree Marksheet (for PG courses only) | Yes | - |
| Aadhaar Card | Yes | No |
| Migration Certificate | No | Yes |
| Character Certificate | No | Yes |
| Medical Certificate | No | Yes |
| Antiragging | No | Yes |

=== CSE STREAMS DETAILED FAQ ===

Q: What is Computer Science & Engineering (CSE)?
A: CSE is a core engineering discipline that focuses on computer programming, software development, computer systems, algorithms, and computational theory.

Q: What is the duration of the CSE programs?
A: All CSE programs are typically 4-year undergraduate degree programs, divided into 8 semesters.

Q: Are the core subjects common in all CSE streams?
A: Yes. Core subjects such as Programming, Data Structures, Algorithms, Database Management Systems, Operating Systems, and Computer Networks are common, with specialization-specific subjects added later.

Q: What are the eligibility criteria for CSE admission?
A: Generally, candidates must have completed 10+2 with Physics, Mathematics, and one additional science subject, meeting the minimum percentage as prescribed by the university.

Q: What are the career prospects after CSE programs?
A: Graduates can work in IT companies, startups, research organizations, government sectors, or pursue higher studies like M.Tech, MBA, MS, or Ph.D.

=== CSE (CORE) ===

Q: Who should choose CSE (Core)?
A: Students interested in software development, system design, programming, and core computer science concepts should opt for CSE (Core).

Q: What subjects are covered in CSE (Core)?
A: Programming Languages (C, C++, Java, Python), Data Structures & Algorithms, Operating Systems, Computer Networks, Software Engineering, Database Management Systems.

Q: What job roles are available for CSE (Core) graduates?
A: Software Engineer, Full Stack Developer, System Analyst, Network Engineer, Database Administrator, and Application Developer.

=== CSE (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING) ===

Q: What is CSE (AI & ML)?
A: This specialization focuses on building intelligent systems that can learn, reason, and make decisions using data.

Q: What subjects are taught in CSE (AI & ML)?
A: Artificial Intelligence, Machine Learning, Deep Learning, Neural Networks, Natural Language Processing, Computer Vision, Robotics (introductory level).

Q: Who should opt for CSE (AI & ML)?
A: Students interested in automation, intelligent systems, predictive models, and future technologies should choose this stream.

Q: What are the career options after CSE (AI & ML)?
A: AI Engineer, Machine Learning Engineer, Data Analyst, Research Engineer, Robotics Engineer, and Automation Specialist.

=== CSE (DATA SCIENCE) ===

Q: What is CSE (Data Science)?
A: CSE (Data Science) focuses on extracting insights from large volumes of data using statistics, programming, and machine learning techniques.

Q: What subjects are included in CSE (Data Science)?
A: Data Science Fundamentals, Big Data Analytics, Data Mining, Statistical Analysis, Machine Learning, Data Visualization, Business Intelligence Tools.

Q: Who should choose CSE (Data Science)?
A: Students who enjoy data analysis, statistics, problem-solving, and working with large datasets should opt for this specialization.

Q: What job roles are available after CSE (Data Science)?
A: Data Scientist, Data Analyst, Business Analyst, Big Data Engineer, Data Engineer, and Analytics Consultant.

=== CSE (CYBER SECURITY) ===

Q: What is CSE (Cyber Security)?
A: This specialization focuses on protection of systems, networks, and data from cyber threats.

Q: What subjects are included in CSE (Cyber Security)?
A: Cyber Security, Network Security, Cryptography, Ethical Hacking, Digital Forensics.

Q: What are the career options after CSE (Cyber Security)?
A: Cyber Security Analyst, Ethical Hacker, SOC Analyst, Security Engineer.

=== CSE STREAM COMPARISON ===

Q: Which CSE stream is best?
A: There is no single "best" stream. The best choice depends on your interest, aptitude, and career goals:
- CSE (Core): Broad and flexible foundation - best for those wanting strong fundamentals
- CSE (AI & ML): Future-focused and research-oriented - for those interested in intelligent systems and automation
- CSE (Data Science): Industry-driven and data-centric - for those who enjoy data and analytics
- CSE (Cyber Security): Security-focused and practice-oriented - for those interested in security, hacking & cyber defense

Q: Can students pursue higher studies after specialization streams?
A: Yes. Students can pursue M.Tech/MS/Ph.D. in CSE, AI, ML, Data Science, Cyber Security, or related interdisciplinary fields.

=== CSE STREAMS COMPARISON TABLE ===

Program Focus:
- CSE (Core): Fundamental computer science and software engineering
- CSE (AI & ML): Intelligent systems and automated decision-making
- CSE (Data Science): Data analysis, insights, and data-driven solutions
- CSE (Cyber Security): Protection of systems, networks, and data from cyber threats

Nature of Curriculum:
- CSE (Core): Broad and versatile
- CSE (AI & ML): Advanced and specialization-oriented
- CSE (Data Science): Application-oriented and industry-focused
- CSE (Cyber Security): Security-focused and practice-oriented

Key Subjects:
- CSE (Core): Programming, Data Structures, OS, DBMS, CN, Software Engineering
- CSE (AI & ML): AI, ML, Deep Learning, NLP, Computer Vision
- CSE (Data Science): Data Science, Big Data, Data Mining, Statistics, Visualization
- CSE (Cyber Security): Cyber Security, Network Security, Cryptography, Ethical Hacking, Digital Forensics

Mathematics Requirement:
- CSE (Core): Moderate
- CSE (AI & ML): High (Linear Algebra, Probability)
- CSE (Data Science): High (Statistics, Probability)
- CSE (Cyber Security): Moderate (Discrete Math, Cryptography basics)

Programming Skills Needed:
- CSE (Core): C, C++, Java, Python
- CSE (AI & ML): Python, AI frameworks
- CSE (Data Science): Python, SQL, R, Big Data tools
- CSE (Cyber Security): C, Python, Scripting, Networking tools

Learning Approach:
- CSE (Core): Theory + Practical
- CSE (AI & ML): Research + Practical + Projects
- CSE (Data Science): Practical + Case Studies
- CSE (Cyber Security): Hands-on labs, simulations, and security audits

Industry Demand:
- CSE (Core): Consistent and stable
- CSE (AI & ML): Rapidly growing
- CSE (Data Science): High and data-driven
- CSE (Cyber Security): Very high due to increasing cyber threats

Career Orientation:
- CSE (Core): General IT and software roles
- CSE (AI & ML): Future technologies and research roles
- CSE (Data Science): Business analytics and decision support
- CSE (Cyber Security): Security, defense, compliance, and risk management

Typical Job Roles:
- CSE (Core): Software Engineer, Full Stack Developer, System Analyst
- CSE (AI & ML): AI Engineer, ML Engineer, Research Engineer
- CSE (Data Science): Data Scientist, Data Analyst, Business Analyst
- CSE (Cyber Security): Cyber Security Analyst, Ethical Hacker, SOC Analyst, Security Engineer

Placement Flexibility:
- CSE (Core): Very High
- CSE (AI & ML): High
- CSE (Data Science): High
- CSE (Cyber Security): High (IT, Finance, Govt., Defense)

Higher Studies Options:
- CSE (Core): M.Tech/MS/Ph.D. in CSE
- CSE (AI & ML): M.Tech/MS/Ph.D. in AI/ML/CSE
- CSE (Data Science): M.Tech/MS/Ph.D. in Data Science/Analytics
- CSE (Cyber Security): M.Tech/MS/Ph.D. in Cyber Security/Information Security

Long-Term Career Scope:
- CSE (Core): Stable and evergreen
- CSE (AI & ML): Highly innovative and future-oriented
- CSE (Data Science): Expanding across all industries
- CSE (Cyber Security): Critical and globally in-demand

=== CONTACT INFORMATION ===

For more information, contact:
- Toll-free helpline: 1800-121-884444
- Website: https://www.juet.ac.in/
- Admissions page: https://www.juet.ac.in/jaypee/admission.php
`;

const SYSTEM_PROMPT = `You are the official JUET Guna AI Assistant. You ONLY answer questions related to Jaypee University of Engineering and Technology, Guna using the knowledge base provided below.

STRICT RULES:
1. ONLY answer questions if the information exists in the JUET Knowledge Base below
2. If the question is NOT related to JUET or the answer is NOT in the knowledge base, respond with: "I'm sorry, this information is not available in my knowledge base. I can only help with questions about JUET Guna. For other queries, please contact JUET directly at 1800-121-884444 or visit https://www.juet.ac.in/"
3. DO NOT use any external knowledge or make up information
4. DO NOT answer general questions unrelated to JUET (e.g., weather, news, other universities, coding, general knowledge)
5. Be friendly and professional
6. Use clear formatting with bullet points when listing items
7. Provide specific numbers, dates, and details from the knowledge base when available

Your knowledge base contains information about:
- General information about JUET (location, recognition, rankings)
- Programs offered (Diploma, B.Tech, M.Tech, M.Sc, PhD)
- Admission procedures for all programs
- Defence quota and fee information
- Infrastructure and facilities (hostel, library, sports)
- Scholarships available
- Campus life and collaborations
- Documents required for admission
- Detailed CSE streams information (Core, AI & ML, Data Science, Cyber Security)
- CSE streams comparison and career guidance

JUET Knowledge Base:
${JUET_KNOWLEDGE}

Remember: You are STRICTLY limited to the knowledge base above. Do not provide any information that is not explicitly mentioned in the knowledge base.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client identifier for rate limiting (IP or fallback)
    const clientId = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "anonymous";
    
    // Check rate limit
    if (isRateLimited(clientId)) {
      console.log(`Rate limited client: ${clientId}`);
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please wait a moment before trying again.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { messages } = await req.json();
    
    // Get the last user message for cache lookup
    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === "user")
      .pop()?.content || "";
    
    // Check if we have a cached response for common questions
    const cacheKey = getCacheKey(lastUserMessage);
    if (cacheKey && CACHED_RESPONSES[cacheKey]) {
      console.log(`Cache hit for: ${cacheKey}`);
      return new Response(createSSEResponse(CACHED_RESPONSES[cacheKey]), {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`AI request from: ${clientId}, message: ${lastUserMessage.substring(0, 50)}...`);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Service is busy. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Service temporarily unavailable. Please try again later.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get response from AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});