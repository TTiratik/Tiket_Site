import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export interface Complaint {
  id: number
  user_id: string
  user_nickname: string
  violator_nickname: string
  incident_date: string
  evidence: string
  status: "active" | "closed"
  created_at: string
  updated_at: string
}

export interface ComplaintMessage {
  id: number
  complaint_id: number
  sender_id: string
  message: string
  is_admin_message: boolean
  created_at: string
  sender_name?: string
}

// Функции для работы с пользователями
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM neon_auth.users_sync 
    WHERE email = ${email}
    LIMIT 1
  `
  return result[0] || null
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM neon_auth.users_sync 
    WHERE id = ${id}
    LIMIT 1
  `
  return result[0] || null
}

export async function createUser(id: string, email: string, name: string): Promise<User> {
  const result = await sql`
    INSERT INTO neon_auth.users_sync (id, email, name, role, created_at, updated_at)
    VALUES (${id}, ${email}, ${name}, 'user', NOW(), NOW())
    RETURNING *
  `
  return result[0]
}

// Функции для работы с жалобами
export async function getComplaintsByUserId(userId: string): Promise<Complaint[]> {
  const result = await sql`
    SELECT * FROM complaints 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return result
}

export async function getAllComplaints(): Promise<Complaint[]> {
  const result = await sql`
    SELECT * FROM complaints 
    ORDER BY created_at DESC
  `
  return result
}

export async function createComplaint(
  userId: string,
  userNickname: string,
  violatorNickname: string,
  incidentDate: string,
  evidence: string,
): Promise<Complaint> {
  const result = await sql`
    INSERT INTO complaints (user_id, user_nickname, violator_nickname, incident_date, evidence)
    VALUES (${userId}, ${userNickname}, ${violatorNickname}, ${incidentDate}, ${evidence})
    RETURNING *
  `
  return result[0]
}

export async function updateComplaintStatus(id: number, status: "active" | "closed"): Promise<void> {
  await sql`
    UPDATE complaints 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
  `
}

// Функции для работы с сообщениями
export async function getComplaintMessages(complaintId: number): Promise<ComplaintMessage[]> {
  const result = await sql`
    SELECT cm.*, u.name as sender_name
    FROM complaint_messages cm
    JOIN neon_auth.users_sync u ON cm.sender_id = u.id
    WHERE cm.complaint_id = ${complaintId}
    ORDER BY cm.created_at ASC
  `
  return result
}

export async function addComplaintMessage(
  complaintId: number,
  senderId: string,
  message: string,
  isAdminMessage = false,
): Promise<ComplaintMessage> {
  const result = await sql`
    INSERT INTO complaint_messages (complaint_id, sender_id, message, is_admin_message)
    VALUES (${complaintId}, ${senderId}, ${message}, ${isAdminMessage})
    RETURNING *
  `
  return result[0]
}
