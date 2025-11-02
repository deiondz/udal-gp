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

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = React.useState<{
		currentPassword?: string;
		newPassword?: string;
		confirmPassword?: string;
	}>({});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});

		const formData = new FormData(e.currentTarget);
		const data: ChangePasswordFormData = {
			currentPassword: formData.get("currentPassword") as string,
			newPassword: formData.get("newPassword") as string,
			confirmPassword: formData.get("confirmPassword") as string,
		};

		// Validate with Zod
		const validationResult = changePasswordSchema.safeParse(data);

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
				const { error } = await authClient.changePassword({
					currentPassword: validationResult.data.currentPassword,
					newPassword: validationResult.data.newPassword,
				});

				if (error) {
					toast.error(
						error.message || "Failed to change password. Please try again.",
					);
					return;
				}

				toast.success("Password changed successfully!");
				router.refresh();
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
					<h1 className="text-2xl font-bold">Change Password</h1>
					<p className="text-muted-foreground text-sm text-balance">
						Enter your current password and choose a new password
					</p>
				</div>

				<Field data-invalid={!!errors.currentPassword}>
					<FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
					<FieldContent>
						<Input
							id="currentPassword"
							name="currentPassword"
							type="password"
							required
							aria-invalid={!!errors.currentPassword}
							aria-describedby={
								errors.currentPassword ? "currentPassword-error" : undefined
							}
						/>
						{errors.currentPassword && (
							<FieldError
								id="currentPassword-error"
								errors={[{ message: errors.currentPassword }]}
							/>
						)}
					</FieldContent>
				</Field>

				<Field data-invalid={!!errors.newPassword}>
					<FieldLabel htmlFor="newPassword">New Password</FieldLabel>
					<FieldContent>
						<Input
							id="newPassword"
							name="newPassword"
							type="password"
							required
							aria-invalid={!!errors.newPassword}
							aria-describedby={
								errors.newPassword ? "newPassword-error" : undefined
							}
						/>
						{errors.newPassword && (
							<FieldError
								id="newPassword-error"
								errors={[{ message: errors.newPassword }]}
							/>
						)}
					</FieldContent>
				</Field>

				<Field data-invalid={!!errors.confirmPassword}>
					<FieldLabel htmlFor="confirmPassword">
						Confirm New Password
					</FieldLabel>
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
						{isPending ? "Changing password..." : "Change Password"}
					</Button>
				</Field>
			</FieldGroup>
		</form>
	);
}
