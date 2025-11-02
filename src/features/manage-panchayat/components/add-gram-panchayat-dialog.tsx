"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsMobile } from "~/hooks/use-mobile";
import { Button } from "~/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "~/components/ui/form";
import { IconPlus } from "@tabler/icons-react";
import { createGramPanchayat } from "../actions";
import { toast } from "sonner";
import { MRF_UNIT_MAP } from "../constants";
import type { CreateGramPanchayatRequest } from "../schema";

const formSchema = z.object({
	email: z
		.string()
		.email("Please enter a valid email address")
		.min(1, "Email is required"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	name: z.string().min(1, "Name is required"),
	taluk: z.string().min(1, "Taluk is required"),
	village: z.string().min(1, "Village is required"),
	sarpanch: z.string().min(1, "Sarpanch is required"),
	status: z.enum(["Active", "Inactive"]),
	mrfUnitId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddGramPanchayatDialogProps {
	onSuccess?: () => void;
}

export function AddGramPanchayatDialog({
	onSuccess,
}: AddGramPanchayatDialogProps) {
	const isMobile = useIsMobile();
	const [isOpen, setIsOpen] = useState(false);
	const firstInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
			taluk: "",
			village: "",
			sarpanch: "",
			status: "Active",
			mrfUnitId: "none",
		},
	});

	async function onSubmit(values: FormValues) {
		const mrfUnitId = values.mrfUnitId;
		const mrfMapped =
			mrfUnitId !== null && mrfUnitId !== "" && mrfUnitId !== "none";

		const gpData = {
			name: values.name,
			taluk: values.taluk,
			village: values.village,
			sarpanch: values.sarpanch,
			status: values.status,
			mrfUnitId: mrfMapped && mrfUnitId ? mrfUnitId : null,
			mrfUnitName:
				mrfMapped && mrfUnitId ? (MRF_UNIT_MAP[mrfUnitId] ?? null) : null,
			mrfMapped,
		};

		const requestData: CreateGramPanchayatRequest = {
			email: values.email,
			password: values.password,
			data: gpData,
		};

		try {
			await createGramPanchayat(requestData);
			toast.success("Gram Panchayat created successfully");
			form.reset();
			setIsOpen(false);
			onSuccess?.();
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to create Gram Panchayat";
			toast.error(errorMessage);
		}
	}

	const triggerButton = (
		<Button variant="outline" size="sm" aria-label="Add new Gram Panchayat">
			<IconPlus aria-hidden="true" />
			<span className="hidden lg:inline">Add Gram Panchayat</span>
			<span className="lg:hidden">Add</span>
		</Button>
	);

	return (
		<Drawer
			open={isOpen}
			onOpenChange={setIsOpen}
			direction={isMobile ? "bottom" : "right"}
		>
			<DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="gap-1 px-4 sm:px-6">
					<DrawerTitle>Add New Gram Panchayat</DrawerTitle>
					<DrawerDescription>
						Create a new Gram Panchayat entry with essential information
					</DrawerDescription>
				</DrawerHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-6 overflow-y-auto px-4 pb-4 text-sm sm:px-6"
					>
						<div className="space-y-4">
							<h3 className="text-sm font-semibold text-foreground">
								Account Credentials
							</h3>
							<div className="grid grid-cols-1 gap-4 ">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Email <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="Enter email address"
													{...field}
													ref={firstInputRef}
													aria-required="true"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Password <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Enter password"
													{...field}
													aria-required="true"
												/>
											</FormControl>
											<FormDescription>
												Must be at least 8 characters long
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-sm font-semibold text-foreground">
								Gram Panchayat Information
							</h3>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Name <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter Gram Panchayat name"
												{...field}
												aria-required="true"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<FormField
									control={form.control}
									name="taluk"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Taluk <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter Taluk name"
													{...field}
													aria-required="true"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="village"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Village <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter Village name"
													{...field}
													aria-required="true"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<FormField
									control={form.control}
									name="sarpanch"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Sarpanch <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter Sarpanch name"
													{...field}
													aria-required="true"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Status <span className="text-destructive">*</span>
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger aria-required="true">
														<SelectValue placeholder="Select status" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="Active">Active</SelectItem>
													<SelectItem value="Inactive">Inactive</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-sm font-semibold text-foreground">
								MRF Unit Mapping
							</h3>
							<FormField
								control={form.control}
								name="mrfUnitId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>MRF Unit</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select MRF Unit" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">Not Mapped</SelectItem>
													{Object.entries(MRF_UNIT_MAP).map(([id, name]) => (
														<SelectItem key={id} value={id}>
															{id} - {name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormDescription>
											Select the MRF unit this Gram Panchayat is mapped to, or
											leave as "Not Mapped"
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DrawerFooter className="mt-4 px-0 sm:px-0">
							<Button
								type="submit"
								disabled={form.formState.isSubmitting}
								aria-label="Create Gram Panchayat"
							>
								{form.formState.isSubmitting ? "Creating..." : "Create"}
							</Button>
							<DrawerClose asChild>
								<Button
									variant="outline"
									disabled={form.formState.isSubmitting}
									aria-label="Cancel and close dialog"
								>
									Cancel
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
