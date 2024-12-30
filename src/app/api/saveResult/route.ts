import { getUser } from "@/lib/getUser"
import { connectToDatabase } from "@/lib/utils"
import { User } from "@/models/userModel"
import { User as Usertype } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase()

		const { email } = (await getUser()) as Usertype

		const user = await User.findOne({ email })

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		const { type, subType, wpm } = await req.json()

		if (!type || !subType || typeof wpm !== "number" || wpm < 0) {
			return NextResponse.json({ error: "Invalid data" }, { status: 400 })
		}

		const defaultResults = [
			JSON.stringify({ type: "quotes", subType: "small", wpm: 0 }),
			JSON.stringify({ type: "quotes", subType: "medium", wpm: 0 }),
			JSON.stringify({ type: "quotes", subType: "large", wpm: 0 }),
			JSON.stringify({ type: "words", subType: "10", wpm: 0 }),
			JSON.stringify({ type: "words", subType: "25", wpm: 0 }),
			JSON.stringify({ type: "words", subType: "50", wpm: 0 }),
			JSON.stringify({ type: "words", subType: "100", wpm: 0 }),
			JSON.stringify({ type: "time", subType: "15", wpm: 0 }),
			JSON.stringify({ type: "time", subType: "30", wpm: 0 }),
			JSON.stringify({ type: "time", subType: "60", wpm: 0 }),
			JSON.stringify({ type: "time", subType: "120", wpm: 0 }),
		]

		if (user.allResults.length === 0) {
			defaultResults.forEach((result) => {
				user.allResults.push(result)
			})
		}

		const existingResultIndex = user.allResults.findIndex((resultStr: string) => {
			const result = JSON.parse(resultStr)
			return result.type === type && result.subType === String(subType)
		})

		if (existingResultIndex !== -1) {
			const existingResult = JSON.parse(user.allResults[existingResultIndex])
			if (existingResult.wpm < wpm) {
				existingResult.wpm = wpm
				user.allResults[existingResultIndex] = JSON.stringify(existingResult)
			}
		}

		await User.findOneAndUpdate(
			{ email },
			{ $set: { allResults: user.allResults } },
			{ new: true, runValidators: true }
		)

		return NextResponse.json(
			{ message: "Result Saved successfully" },
			{ status: 200 }
		)
	} catch (error) {
		return NextResponse.json({ error: "Failed to save Result" }, { status: 500 })
	}
}
