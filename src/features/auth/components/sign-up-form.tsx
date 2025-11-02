"use client";

import * as React from "react";
import { useTransition } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
	const [errors, setErrors] = React.useState<{
		email?: string;
		password?: string;
		confirmPassword?: string;
	}>({});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});

		const formData = new FormData(e.currentTarget);
		const data: SignUpFormData = {
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
					name: validationResult.data.email,
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
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Create an account</h1>
					<p className="text-muted-foreground text-sm text-balance">
						Enter your email below to create your account
					</p>
				</div>

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
						<Input
							id="password"
							name="password"
							type="password"
							required
							aria-invalid={!!errors.password}
							aria-describedby={errors.password ? "password-error" : undefined}
						/>
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
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							required
							aria-invalid={!!errors.confirmPassword}
							aria-describedby={
								errors.confirmPassword ? "confirmPassword-error" : undefined
							}
						/>
						{errors.confirmPassword && (
							<FieldError
								id="confirmPassword-error"
								errors={[{ message: errors.confirmPassword }]}
							/>
						)}
					</FieldContent>
				</Field>

				<Field>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Creating account..." : "Sign Up"}
					</Button>
				</Field>

				<div className="text-center text-sm">
					Already have an account?{" "}
					<a
						href="/auth/sign-in"
						className="underline-offset-4 hover:underline"
					>
						Sign in
					</a>
				</div>
			</FieldGroup>
		</form>
	);
}
