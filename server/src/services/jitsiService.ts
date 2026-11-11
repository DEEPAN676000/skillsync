import crypto from 'crypto';

export interface JitsiRoomConfig {
  roomName: string;
  domain: string;
  meetingUrl: string;
  jwtToken?: string;
}

export const generateJitsiRoom = (classTitle: string, classId: string): JitsiRoomConfig => {
  const domain = process.env.JITSI_DOMAIN || 'meet.jit.si';
  const cleanTitle = classTitle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 15);
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const roomName = `SkillSync_${cleanTitle}_${classId.slice(-6)}_${randomSuffix}`;

  return {
    roomName,
    domain,
    meetingUrl: `https://${domain}/${roomName}`,
  };
};

