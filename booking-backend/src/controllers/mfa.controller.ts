import { Request, Response } from 'express';
import { verifySetupSchema } from '../validators/mfa.validator';
import { confirmMfaSetup, setupMfa } from '../services/mfa.service';
import { getUserById } from '../services/user.service';

export async function setup(req: Request, res: Response) {
    const user = await getUserById(req.user!.sub);
    const { qrCodeDataUrl, secret } = await setupMfa(req.user!.sub, user.email);
    res.status(200).json({ qrCodeDataUrl, secret });
}

export async function verifySetup(req: Request, res: Response) {
    const { code } = verifySetupSchema.parse(req.body);
    const { backupCodes } = await confirmMfaSetup(req.user!.sub, code);
    res.status(200).json({ message: 'MFA enabled successfully', backupCodes });
}
