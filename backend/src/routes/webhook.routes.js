import { Router } from 'express';
import { Webhook } from 'svix';
import { prisma } from '../db';
import { config } from '../config';
const router = Router();
/**
 * POST /webhooks/clerk
 * Syncs Clerk user lifecycle events (user.created, user.deleted) with our DB.
 * Svix verifies the signature so only real Clerk events are processed.
 */
router.post('/', async (req, res) => {
    const svixId = req.headers['svix-id'];
    const svixTs = req.headers['svix-timestamp'];
    const svixSig = req.headers['svix-signature'];
    if (!svixId || !svixTs || !svixSig) {
        res.status(400).json({ error: 'Missing svix headers' });
        return;
    }
    const wh = new Webhook(config.clerk.webhookSecret);
    let event;
    try {
        event = wh.verify(JSON.stringify(req.body), {
            'svix-id': svixId,
            'svix-timestamp': svixTs,
            'svix-signature': svixSig,
        });
    }
    catch {
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
    }
    const { type, data } = event;
    if (type === 'user.created') {
        const email = data.email_addresses?.[0]?.email_address ?? '';
        await prisma.user.upsert({
            where: { clerkId: data.id },
            update: { email },
            create: { clerkId: data.id, email },
        });
    }
    if (type === 'user.deleted') {
        await prisma.user.deleteMany({
            where: { clerkId: data.id },
        });
    }
    res.json({ received: true });
});
export default router;
