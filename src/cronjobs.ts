import cron from "node-cron";
import { Round } from "./schemas/round";
import cryptoModule, { randomUUID } from "crypto";
import { client } from "./neynar/client";
import * as Sentry from "@sentry/node";

// Function to update rounds
const updateRounds = async () => {
	const now = new Date();

	try {
		const rounds = await Round.find({
			$or: [
				{ status: "nominating", nominationEndTime: { $lte: now } },
				{ status: "voting", votingEndTime: { $lte: now } },
			],
		});

		await Promise.all(
			rounds.map(async (round) => {
				if (round.status === "nominating" && now >= round.nominationEndTime) {
					round.status = "voting";
					round.votingStartTime = now;
				} else if (round.status === "voting") {
					round.status = "completed";
					const { castHash, castURL, nominationId } = await saveWinner(
						round.id,
					);
					round.winner = castHash;
					round.castURL = castURL;
					round.nominationId = nominationId;
				}

				await round.save();
			}),
		);
	} catch (error) {
		Sentry.captureException(`Error updating rounds: ${error}`);
		throw error;
	}
};

const createNewRound = async () => {
	const nominationEndTime = new Date();
	nominationEndTime.setUTCHours(18, 0, 0, 0);

	const votingEndTime = new Date(nominationEndTime);
	votingEndTime.setUTCDate(votingEndTime.getUTCDate() + 1);

	const roundId = cryptoModule.randomUUID();
	const lastRound = await Round.findOne().sort({ createdAt: -1 });
	const newRoundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

	const newRound = new Round({
		id: roundId,
		roundNumber: newRoundNumber,
		nominationStartTime: new Date(),
		nominationEndTime,
		votingStartTime: nominationEndTime,
		votingEndTime,
		createdAt: new Date(),
		status: "nominating",
		winner: "",
	});

	try {
		await newRound.validate();
		await newRound.save();

		return newRound;
	} catch (error) {
		Sentry.captureException(`Error creating new round: ${error}`);
		throw error;
	}
};

export const findCastWinner = async (roundId: string) => {
	const endpoint = `${process.env.PUBLIC_URL}/nominationsByRound?roundId=${roundId}`;

	try {
		const response = await fetch(endpoint);
		const json = await response.json();

		const isEmpty = json.length === 0;
		if (!isEmpty) {
			const sorted = json.sort(
				(a: { votesCount: number }, b: { votesCount: number }) =>
					b.votesCount - a.votesCount,
			);
			const castWinner = sorted[0];

			return castWinner;
		} else {
			return "";
		}
	} catch (error) {
		Sentry.captureException(`Error finding cast winner: ${error}`);
		throw error;
	}
};

export const saveWinner = async (roundId: string) => {
	try {
		const castWinner = await findCastWinner(roundId);
		const castURL = `https://warpcast.com/${castWinner.username}/${castWinner.castId}`;

		const cast = await client.lookUpCastByHashOrWarpcastUrl(castURL, "url");

		return {
			castURL: castURL,
			castHash: cast.cast.hash,
			nominationId: castWinner.id,
		};
	} catch (error) {
		Sentry.captureException(`Error saving winner: ${error}`);
		throw error;
	}
};

const sendDm = async () => {
	const startDate = new Date();
	startDate.setUTCHours(0, 0, 0, 0);

	const endDate = new Date();
	endDate.setUTCHours(18, 0, 0, 0);

	const result = await fetch(
		`${process.env.PUBLIC_URL}/nominationsByFidAndDate?startDate=${startDate}&endDate=${endDate}`,
	);
	const json: { fid: number; username: string; castId: string }[] =
		await result.json();

	const requestHeaders: HeadersInit = new Headers();
	requestHeaders.set("Content-Type", "application/json");
	requestHeaders.set("Authorization", `Bearer ${process.env.FC_API_KEY}`);

	await Promise.all(
		json.map((value) =>
			fetch(`https://api.warpcast.com/v2/ext-send-direct-cast`, {
				headers: requestHeaders,
				method: "PUT",
				body: JSON.stringify({
					recipientFid: value.fid,
					message: `Hello, you have nominated the following cast:\n\nhttps://warpcast.com/${value.username}/${value.castId}\n\nYou can now vote via the frame below:\n\nhttps://toth-frame.vercel.app/toth`,
					idempotencyKey: randomUUID().toString(),
				}),
			}),
		),
	);
};

// Export the cron job setup function
export const setupCronJobs = async () => {
	cron.schedule("0 0 * * *", async () => {
		await createNewRound();
		Sentry.captureMessage("Updating rounds: 12 AM UTC");
	});

	cron.schedule("0 18 * * *", async () => {
		await updateRounds();
		Sentry.captureMessage("Updating rounds: 6 PM UTC");
	});

	cron.schedule("1 18 * * *", async () => {
		try {
			await sendDm();
			console.log("DM sent successfully at 18:01");
		} catch (error) {
			Sentry.captureException(`Error sending DM: ${error}`);
		}
	});
};
