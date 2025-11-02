"use client";

import * as React from "react";
import { useTransition } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldError,
	FieldContent,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { authClient } from "~/lib/auth-client";

const signUpSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [showPassword, setShowPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
	const [errors, setErrors] = React.useState<{
		name?: string;
		email?: string;
		password?: string;
		confirmPassword?: string;
	}>({});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});

		const formData = new FormData(e.currentTarget);
		const data: SignUpFormData = {
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			password: formData.get("password") as string,
			confirmPassword: formData.get("confirmPassword") as string,
		};

		// Validate with Zod
		const validationResult = signUpSchema.safeParse(data);

		if (!validationResult.success) {
			const fieldErrors: typeof errors = {};
			for (const error of validationResult.error.issues) {
				fieldErrors[error.path[0] as keyof typeof fieldErrors] = error.message;
			}
			setErrors(fieldErrors);
			return;
		}

		startTransition(async () => {
			try {
				const { data: signUpData, error } = await authClient.signUp.email({
					email: validationResult.data.email,
					password: validationResult.data.password,
					name: validationResult.data.name,
				});

				if (error) {
					toast.error(error.message || "Failed to sign up. Please try again.");
					return;
				}

				if (signUpData?.user) {
					toast.success("Account created successfully!");
					// Redirect to dashboard after successful sign up
					router.push("/dashboard");
					router.refresh();
				}
			} catch (err) {
				toast.error(
					err instanceof Error
						? err.message
						: "An unexpected error occurred. Please try again.",
				);
			}
		});
	};

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			onSubmit={handleSubmit}
			{...props}
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-3xl font-bold tracking-tight">
						Create your account
					</h1>
					<p className="text-muted-foreground text-sm">
						Join us today and get started in seconds
					</p>
				</div>

				<Field data-invalid={!!errors.name}>
					<FieldLabel htmlFor="name">Full Name</FieldLabel>
					<FieldContent>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="John Doe"
							required
							aria-invalid={!!errors.name}
							aria-describedby={errors.name ? "name-error" : undefined}
						/>
						{errors.name && (
							<FieldError id="name-error" errors={[{ message: errors.name }]} />
						)}
					</FieldContent>
				</Field>

				<Field data-invalid={!!errors.email}>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<FieldContent>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="m@example.com"
							required
							aria-invalid={!!errors.email}
							aria-describedby={errors.email ? "email-error" : undefined}
						/>
						{errors.email && (
							<FieldError
								id="email-error"
								errors={[{ message: errors.email }]}
							/>
						)}
					</FieldContent>
				</Field>

				<Field data-invalid={!!errors.password}>
					<FieldLabel htmlFor="password">Password</FieldLabel>
					<FieldContent>
						<div className="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
								required
								aria-invalid={!!errors.password}
								aria-describedby={
									errors.password ? "password-error" : undefined
								}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						{errors.password && (
							<FieldError
								id="password-error"
								errors={[{ message: errors.password }]}
							/>
						)}
					</FieldContent>
				</Field>

				<Field data-invalid={!!errors.confirmPassword}>
					<FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
					<FieldContent>
						<div className="relative">
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Re-enter your password"
								required
								aria-invalid={!!errors.confirmPassword}
								aria-describedby={
									errors.confirmPassword ? "confirmPassword-error" : undefined
								}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								aria-label={
									showConfirmPassword ? "Hide password" : "Show password"
								}
							>
								{showConfirmPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						{errors.confirmPassword && (
							<FieldError
								id="confirmPassword-error"
								errors={[{ message: errors.confirmPassword }]}
							/>
						)}
					</FieldContent>
				</Field>

				<Field>
					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? "Creating account..." : "Sign Up"}
					</Button>
				</Field>

				<div className="text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<a
						href="/auth/sign-in"
						className="font-semibold text-foreground underline-offset-4 hover:underline"
					>
						Sign in
					</a>
				</div>
			</FieldGroup>
		</form>
	);
}
