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
	const [showPassword, setShowPassword] = React.useState(false);
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
			for (const error of validationResult.error.issues) {
				fieldErrors[error.path[0] as keyof typeof fieldErrors] = error.message;
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
					// Redirect to dashboard after successful sign in
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
					<h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
					<p className="text-muted-foreground text-sm">
						Sign in to your account to continue
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
					<div className="flex items-center justify-between">
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<a
							href="/forgot-password"
							className="text-xs font-medium text-primary hover:underline underline-offset-2"
						>
							Forgot password?
						</a>
					</div>
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

				<Field orientation="horizontal">
					<FieldContent>
						<div className="flex items-center gap-2">
							<input
								id="rememberMe"
								name="rememberMe"
								type="checkbox"
								className="h-4 w-4 rounded border-input accent-primary"
							/>
							<FieldLabel
								htmlFor="rememberMe"
								className="cursor-pointer text-sm"
							>
								Remember me
							</FieldLabel>
						</div>
					</FieldContent>
				</Field>

				<Field>
					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? "Signing in..." : "Sign In"}
					</Button>
				</Field>

				<div className="text-center text-sm text-muted-foreground">
					Don't have an account?{" "}
					<a
						href="/auth/sign-up"
						className="font-semibold text-foreground underline-offset-4 hover:underline"
					>
						Sign up
					</a>
				</div>
			</FieldGroup>
		</form>
	);
}
