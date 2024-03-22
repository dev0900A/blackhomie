const defaultIntegral = 1;
const { query } = require('../../public/pool');
import randomstring from 'randomstring';

const getUserInviteLink = async (inviter) => await query('SELECT * from user_invite_link where inviter = $1', [inviter]);
const getUserInviteLinkByInviterCode = async (inviteCode) => await query('SELECT * from user_invite_link where inviter_code = $1', [inviteCode]);
const getUserInviteLinkRecords = async (inviter) => await query('SELECT * from user_invite_link_records where inviter = $1', [inviter]);
const insertUserInviteLink = async (inviter, inviterCode) => await query('INSERT INTO user_invite_link (inviter, inviter_code) VALUES ($1, $2)', [inviter, inviterCode]);
const insertUserInviteLinkRecords = async (inviter, invitee, inviterCode, ip) => await query('INSERT INTO user_invite_link_records (inviter, invitee, inviter_code, ip) VALUES ($1, $2, $3, $4)', [inviter, invitee, inviterCode, ip]);
const updateUserInviteLink = async (inviter, integral) => await query('UPDATE user_invite_link SET integral = $1 where inviter = $2', [integral, inviter]);

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case 'GET':
                return getInviter(req, res);
            case 'POST':
                return addInviter(req, res);
            case 'PUT':
                return addInvitee(req, res);
            default:
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
}

const getInviter = async (req, res) => {
  let result;
    if (req.query && req.query.inviter) {
      const userInviteLink = await getUserInviteLink(req.query.inviter);
      const userInviteLinkRecords = await getUserInviteLinkRecords(req.query.inviter);
      
      // 创建一个新的对象，将两个查询的结果作为属性
      result = {
          userInviteLink: userInviteLink.rows[0],
          userInviteLinkRecords: userInviteLinkRecords.rows
      };
      res.json(result);
    } else {
        const result = await query('SELECT * from user_invite_link order by integral desc limit 100');
        res.json(result.rows);
    }
};

const addInviter = async (req, res) => {
  try {
    const { inviter } = req.body;
    const result = await getUserInviteLink(inviter);
    if (result.rows.length === 0) {
      const inviteCode = randomstring.generate(12);
      await insertUserInviteLink(inviter, inviteCode);
      res.status(200).json({ message: 'Inviter added successfully' });
    } else {
      res.status(200).json({ message: 'Inviter already exists' });
    }
  } catch (error) {
    res.status(500).json({message:`Server error: ${error.detail}`});
  }
};


const addInvitee = async (req, res) => {
  try {
    const { inviterCode, invitee } = req.body;
    const inviter_result = await getUserInviteLinkByInviterCode(inviterCode);
    const invitee_result = await getUserInviteLink(invitee);
    if (inviter_result.rows.length != 0 && invitee_result.rows.length === 0) {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const newInviteCode = randomstring.generate(12);
      await insertUserInviteLink(invitee, newInviteCode);
      await insertUserInviteLinkRecords(inviter_result.rows[0].inviter, invitee, inviterCode, ip);
      const integral = inviter_result.rows[0].integral + defaultIntegral;
      await updateUserInviteLink(inviter, integral);
      res.status(200).json({ message: 'Invitee added successfully' });
    } else {
      res.status(200).json({ message: 'Invitee could not be added' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.detail}`});
  }
};