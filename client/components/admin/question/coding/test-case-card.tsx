"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Beaker, Plus, Trash2, Code2 } from "lucide-react";

const SUPPORTED_TYPES = [
    "int",
    "float",
    "char",
    "string",
    "int_array",
    "float_array",
    "string_array",
];

export default function TestCaseCard() {
    const { control, watch } = useFormContext();

    const {
        fields: variableFields,
        append: appendVariable,
        remove: removeVariable,
    } = useFieldArray({
        control,
        name: "inputVariables",
    });

    const {
        fields: testCaseFields,
        append: appendTestCase,
        remove: removeTestCase,
    } = useFieldArray({
        control,
        name: "testCases",
    });

    const inputVariables = watch("inputVariables");

    return (
        <div className="space-y-6">
            {/* Function Signature Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-primary" />
                        Function Signature
                    </CardTitle>
                    <CardDescription>
                        Define the function name and input parameters.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={control}
                        name="functionName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Function Name</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="e.g. solve" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <FormLabel className="text-base">Input Variables</FormLabel>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendVariable({ name: "", type: "int" })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Variable
                            </Button>
                        </div>

                        {variableFields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-4">
                                <FormField
                                    control={control}
                                    name={`inputVariables.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} placeholder="Variable Name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name={`inputVariables.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem className="w-[180px]">
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {SUPPORTED_TYPES.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => removeVariable(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {variableFields.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                                No input variables defined.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Test Cases Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Beaker className="h-5 w-5 text-primary" />
                        Test Cases
                    </CardTitle>
                    <CardDescription>
                        Add test cases based on the defined input variables.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {(!inputVariables || inputVariables.length === 0) ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Define input variables above to add test cases.
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendTestCase({ input: {}, output: "" })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Test Case
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {testCaseFields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="p-4 border rounded-lg space-y-4 bg-muted/30"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-sm">Test Case {index + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => removeTestCase(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Inputs Generation */}
                                            <div className="space-y-3 p-3 bg-background/50 rounded-md border">
                                                <span className="text-xs font-semibold uppercase text-muted-foreground">Input</span>
                                                {inputVariables.map((variable: any, vIndex: number) => (
                                                    <FormField
                                                        key={`${field.id}-input-${vIndex}`}
                                                        control={control}
                                                        name={`testCases.${index}.input.${variable.name}`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">{variable.name} <span className="text-muted-foreground font-normal">({variable.type})</span></FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} value={field.value ?? ""} placeholder={`Value for ${variable.name}`} className="h-8 text-sm" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>

                                            {/* Output */}
                                            <div className="space-y-3 p-3 bg-background/50 rounded-md border">
                                                <span className="text-xs font-semibold uppercase text-muted-foreground">Expected Output</span>
                                                <FormField
                                                    control={control}
                                                    name={`testCases.${index}.output`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Textarea
                                                                    {...field}
                                                                    value={field.value ?? ""}
                                                                    placeholder="Expected output"
                                                                    className="min-h-[100px] resize-none font-mono text-sm"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {testCaseFields.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                                        No test cases added.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
