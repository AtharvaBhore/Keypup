"use client"

import validator from "validator"
import { useEffect, useState } from "react"
import { SignOut } from "@/actions/signout"
import { getUser } from "@/lib/getUser"
import { DeleteAccount } from "@/actions/deleteAccount"
import { User } from "next-auth"
import bcryptjs from "bcryptjs"

const ProfileForm = ({ email }: { email: string }) => {
	const [user, setUser] = useState({
		name: "",
		email: "",
	})
	const [success, setSuccess] = useState(false)
	const [updatingPassword, setUpdatingPassword] = useState(false)
	const [error, setError] = useState("")
	const [formData, setFormData] = useState({
		username: "",
		email,
		password: "",
	})

	const getUserData = async () => {
		setError("") // Clear any previous errors
		try {
			const userData = (await getUser()) as User
			const res = await fetch(`/api/user`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			})

			if (!res.ok) {
				throw new Error("Failed to fetch user data")
			}

			const user = await res.json()
			console.log(user)
			setUser({ name: user.name, email: userData.email as string })
		} catch (err) {
			console.error("Error fetching user data:", err)
			setError("Failed to load user data. Please try again.")
		}
	}

	useEffect(() => {
		getUserData()
	}, [])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.id]: e.target.value })
		checkForm(e)
		setSuccess(false)
	}

	const checkForm = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.id === "username") {
			if (e.target.value === "") {
				setError("Username cannot be empty")
			} else if (error === "Username cannot be empty") {
				setError("")
			}
		}
		if (e.target.id === "password") {
			if (e.target.value === "") {
				setError("")
				setUpdatingPassword(false)
			} else {
				setUpdatingPassword(true)
			}
			if (error === "Username cannot be empty") {
				setError("")
			}
		}
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError("") // Clear any previous errors
		setSuccess(false)
		if (formData.username === "" && updatingPassword && formData.password === "") {
			setError("Please fill in all required fields.")
			return
		}

		if (updatingPassword && !validator.isStrongPassword(formData.password)) {
			return setError("Please enter a strong password")
		}

		try {
			const res = await fetch(`/api/userData`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			})

			const data = await res.json()
			if (!res.ok) {
				setError(data.msg || "Failed to update profile.")
			} else {
				console.log(formData, data.name)
				if (!formData.username && !formData.password) {
					setError("No change in profile were made")
					return
				}
				if (data.name === formData.username) {
					if (formData.password !== "") {
						const match = await bcryptjs.compare(
							formData.password,
							data.password
						)
						console.log(match)
						if (match) {
							setError("New password cannot be same as old password")
							return
						}
					} else {
						setError("No change in profile were made")
						return
					}
				}
			}
		} catch (err) {
			console.error("Profile update error:", err)
			setError("An unexpected error occurred. Please try again.")
		}

		try {
			const res = await fetch(`/api/userProfile`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...formData }),
				credentials: "include",
			})

			const data = await res.json()
			if (!res.ok) {
				setError(data.msg || "Failed to update profile.")
			} else {
				setSuccess(true)
				console.log("Profile updated successfully")
				getUserData()
			}
		} catch (err) {
			console.error("Profile update error:", err)
			setError("An unexpected error occurred. Please try again.")
		}
	}

	return (
		<div className="p-2 max-w-lg mx-auto">
			<h1 className="tracking-widest text-3xl max-lg:text-2xl my-7 text-stone-500 dark:text-neutral-500 text-center">
				Profile
			</h1>

			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div>
					<label
						htmlFor="password"
						className="block text-stone-500 dark:text-neutral-400 text-sm font-medium mb-2 ml-2 tracking-wider"
					>
						Username
					</label>
					<input
						type="text"
						defaultValue={user.name}
						id="username"
						placeholder="Username"
						className="w-full text-stone-500 dark:text-neutral-300 font-thin tracking-wider px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-500 bg-transparent"
						onChange={handleChange}
					/>
				</div>
				<div>
					<label
						htmlFor="password"
						className="block text-stone-500 dark:text-neutral-400 text-sm font-medium mb-2 ml-2 tracking-wider"
					>
						Email
					</label>
					<input
						disabled={true}
						type="email"
						defaultValue={user.email}
						id="email"
						placeholder="Email"
						className="w-full text-stone-500 dark:text-neutral-300 font-thin tracking-wider px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-500 bg-neutral-300 dark:bg-neutral-800 cursor-not-allowed"
					/>
				</div>
				<div>
					<label
						htmlFor="password"
						className="block text-stone-500 dark:text-neutral-400 text-sm font-medium mb-2 ml-2 tracking-wider"
					>
						Change Password
					</label>
					<input
						type="password"
						id="password"
						placeholder="Change Password"
						className="w-full text-stone-500 dark:text-neutral-300 font-thin tracking-wider px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-500 bg-transparent"
						onChange={handleChange}
					/>
				</div>
				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-stone-500 dark:text-neutral-400 text-sm font-medium mb-2 ml-2 tracking-wider"
					>
						Confirm Password
					</label>
					<input
						type="password"
						id="confirmPassword"
						placeholder="Confirm Password"
						className="w-full text-stone-500 dark:text-neutral-300 font-thin tracking-wider px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-500 bg-transparent"
						onChange={handleChange}
					/>
				</div>
				<button className="font-medium text-stone-500 w-full mt-4 py-2 px-32 rounded-2xl flex justify-center items-center tracking-wide bg-transparent hover:dark:border-stone-400 border dark:border-stone-800 border-neutral-100 hover:border-stone-600 hover:text-stone-600 dark:text-neutral-500 hover:dark:text-neutral-100 transition-all duration-400">
					Update
				</button>
			</form>

			<div className="flex justify-between mt-5">
				<span
					onClick={async () => {
						try {
							await DeleteAccount(user.email)
						} catch (err) {
							setError("Failed to delete account. Please try again.")
							console.error("Delete account error:", err)
						}
					}}
					className="text-red-500 hover:text-red-700 transition-all duration-200 cursor-pointer mt-2 ml-2 hover:underline font-thin tracking-wider"
				>
					Delete Account
				</span>
				<span
					onClick={async () => {
						try {
							await SignOut()
						} catch (err) {
							setError("Failed to sign out. Please try again.")
							console.error("Sign out error:", err)
						}
					}}
					className="text-red-500 hover:text-red-700 transition-all duration-200 cursor-pointer mt-2 ml-2 hover:underline font-thin tracking-wider"
				>
					Sign Out
				</span>
			</div>

			{error && (
				<p className="text-red-800 mt-5 tracking-wider font-thin text-center">
					{error}
				</p>
			)}
			{success && (
				<p className="text-green-800 mt-5 tracking-wider font-thin text-center">
					Profile updated successfully
				</p>
			)}
		</div>
	)
}

export { ProfileForm }
