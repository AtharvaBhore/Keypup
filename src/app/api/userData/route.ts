import {NextRequest, NextResponse} from "next/server"
import {connectToDatabase} from "@/lib/utils"
import {User} from "@/models/userModel"
import {getUser} from "@/lib/getUser"
import {User as typeUser} from "next-auth"

export async function GET(req: NextRequest) {
	const {email} = (await getUser()) as typeUser
    console.log(email)

	try {
		await connectToDatabase()
		const data = await User.findOne({email})

		if (!data) {
			return NextResponse.json(
				{success: false, error: "User not found"},
				{status: 400}
			)
		}

		const {name, password} = data

		return NextResponse.json({name, password})
	} catch (error) {
		console.error("Error fetching user data", error)
		return NextResponse.json({error: "Failed to get user data"}, {status: 500})
	}
}
