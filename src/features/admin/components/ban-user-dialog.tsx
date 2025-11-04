"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { useBanUserForm, useUnbanUserForm } from "../hooks/use-user-forms";
import { useBanUser, useUnbanUser } from "../hooks/use-user-mutations";
import type { User } from "../schema/schema";
import { useCurrentSession } from "~/hooks/use-current-session";

interface BanUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User;
}

export function BanUserDialog({
	open,
	onOpenChange,
	user,
}: BanUserDialogProps) {
	const isBanned = user.banned === true;
	const { userId: currentUserId } = useCurrentSession();
	const isCurrentUser = currentUserId === user.id;
	const banForm = useBanUserForm();
	const unbanForm = useUnbanUserForm();
	const banMutation = useBanUser();
	const unbanMutation = useUnbanUser();
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

	// Reset date when dialog opens/closes
	useEffect(() => {
		if (!open) {
			setSelectedDate(undefined);
		}
	}, [open]);

	const handleUnban = () => {
		unbanMutation.mutate(
			{ userId: user.id },
			{
				onSuccess: () => {
					onOpenChange(false);
					unbanForm.reset();
				},
			},
		);
	};

	const handleBan = (data: { banReason?: string; banExpiresIn?: number }) => {
		banMutation.mutate(
			{
				userId: user.id,
				banReason: data.banReason,
				banExpiresIn: data.banExpiresIn,
			},
			{
				onSuccess: () => {
					onOpenChange(false);
					banForm.reset();
					setSelectedDate(undefined);
				},
			},
		);
	};

	if (isBanned) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Unban User</DialogTitle>
						<DialogDescription>
							Unban {user.name} to allow sign-in again
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleUnban}
							disabled={unbanMutation.isPending}
						>
							{unbanMutation.isPending ? "Unbanning..." : "Unban User"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ban User</DialogTitle>
					<DialogDescription>
						Ban {user.name} to prevent sign-in
					</DialogDescription>
				</DialogHeader>
				<Form {...banForm}>
					<form
						onSubmit={banForm.handleSubmit(handleBan)}
						className="space-y-4  "
					>
						<FormField
							control={banForm.control}
							name="banReason"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ban Reason (Optional)</FormLabel>
									<FormControl>
										<Input placeholder="Enter reason for ban" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={banForm.control}
							name="banExpiresIn"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ban Expiration Date (Optional)</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													type="button"
													variant="outline"
													className={cn(
														"w-full justify-start text-left font-normal",
														!selectedDate && "text-muted-foreground",
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{selectedDate
														? format(selectedDate, "PPP")
														: "Pick a date"}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={selectedDate}
												onSelect={(date) => {
													setSelectedDate(date);
													// Convert date to seconds from now
													if (date) {
														const now = new Date();
														const diffMs = date.getTime() - now.getTime();
														field.onChange(Math.floor(diffMs / 1000));
													} else {
														field.onChange(undefined);
													}
												}}
												disabled={(date) => date < new Date()}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="mt-4">
							<Button
								type="submit"
								variant="destructive"
								disabled={banMutation.isPending || isCurrentUser}
							>
								{banMutation.isPending ? "Banning..." : "Ban User"}
							</Button>
						</DialogFooter>
						{isCurrentUser && (
							<p className="text-sm text-muted-foreground text-center">
								You cannot ban yourself
							</p>
						)}
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
