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

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = React.useState<{
		email?: string;
		password?: string;
	}>({});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});

		const formData = new FormData(e.currentTarget);
		const data: LoginFormData = {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
			rememberMe: formData.get("rememberMe") === "on",
		};

		// Validate with Zod
		const validationResult = loginSchema.safeParse(data);

		if (!validationResult.success) {
			const fieldErrors: typeof errors = {};
			for (const error of validationResult.error.errors) {
				if (error.path[0]) {
					fieldErrors[error.path[0] as keyof typeof fieldErrors] =
						error.message;
				}
			}
			setErrors(fieldErrors);
			return;
		}

		startTransition(async () => {
			try {
				const { data: signInData, error } = await authClient.signIn.email({
					email: validationResult.data.email,
					password: validationResult.data.password,
					rememberMe: validationResult.data.rememberMe ?? false,
				});

				if (error) {
					toast.error(error.message || "Failed to sign in. Please try again.");
					return;
				}

				if (signInData?.user) {
					toast.success("Signed in successfully!");
					// Redirect to home page or callback URL after successful sign in
					router.push("/");
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
					<h1 className="text-2xl font-bold">Login to your account</h1>
					<p className="text-muted-foreground text-sm text-balance">
						Enter your email below to login to your account
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
					<div className="flex items-center">
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<a
							href="/forgot-password"
							className="ml-auto text-sm underline-offset-4 hover:underline"
						>
							Forgot your password?
						</a>
					</div>
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

				<Field orientation="horizontal">
					<FieldContent>
						<div className="flex items-center gap-2">
							<input
								id="rememberMe"
								name="rememberMe"
								type="checkbox"
								className="h-4 w-4 rounded border-input accent-primary"
							/>
							<FieldLabel htmlFor="rememberMe" className="cursor-pointer">
								Remember me
							</FieldLabel>
						</div>
					</FieldContent>
				</Field>

				<Field>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Signing in..." : "Login"}
					</Button>
				</Field>
			</FieldGroup>
		</form>
	);
}
