"use client";

import React, { memo, useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { CloudUpload, Paperclip } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { parseCSV } from "@/lib/parse/csv-parse";
import Link from "next/link";

interface DataItemProps {
  data: Record<string, string>;
  fields: string[];
}

const DataItem: React.FC<DataItemProps> = memo(({ data, fields }) => (
  <div className="flex flex-row justify-between p-4 border-b border-neutral-600 text-sm">
    {fields.map((field, idx) => (
      <React.Fragment key={idx + field}>
        {field.includes("Company Name") ? (
          <Link
            target="_blank"
            href={`https://www.google.com/search?q=${new URLSearchParams(
              data[field]
            )}`}
            className={`text-blue-500 ${
              field.includes("Email") ? "w-[30%]" : "w-[25%]"
            } text-center`}
          >
            {data["Company Name"]}
          </Link>
        ) : (
          <p
            key={idx + field}
            className={`${
              field.includes("Email") ? "w-[30%]" : "w-[25%]"
            } text-center`}
          >
            {data[field] || "-"}
          </p>
        )}
      </React.Fragment>
    ))}
  </div>
));

DataItem.displayName = "DataItem";

const formSchema = z.object({
  uploadFile: z.array(z.instanceof(File)),
});

const Page = () => {
  const [selectedData, setSelectedData] = useState<Record<string, string>[]>(
    []
  );
  const [files, setFiles] = useState<File[] | null>(null);
  const [fields] = useState([
    "Company Name",
    "Full Name",
    "Personal Email",
    "Work Email",
  ]);

  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  useEffect(() => {
    console.log(files);
  }, [files]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data: Record<string, string>[] = await parseCSV(
        values.uploadFile[0],
        fields
      );

      const parsedData = data
        ?.map((d) => {
          if (d["Work Email"].length > 0) {
            return d;
          }
        })
        .filter((d) => d !== undefined);

      setSelectedData(parsedData);

      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <main className="p-10 text-neutral-600 dark:text-neutral-200 dark:bg-neutral-700 min-h-screen">
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">CSV - for Campaign data import</h1>
        <div className="w-full lg:w-[80%]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 mx-auto py-10"
            >
              <FormField
                control={form.control}
                name="uploadFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select File</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={(files) => {
                          setFiles(files);
                          field.onChange(files);
                        }}
                        dropzoneOptions={dropZoneConfig}
                        className="relative rounded-lg p-2"
                      >
                        <FileInput
                          id="fileInput"
                          className="outline-dashed outline-1 outline-slate-500"
                        >
                          <div className="flex items-center justify-center flex-col p-8 w-full ">
                            <CloudUpload className="text-gray-500 w-8 h-8" />
                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Add CSV, PDFs
                            </p>
                          </div>
                        </FileInput>
                        <FileUploaderContent>
                          {files &&
                            files.length > 0 &&
                            files.map((file, i) => (
                              <FileUploaderItem
                                key={i + file.webkitRelativePath}
                                index={i}
                              >
                                <Paperclip className="h-4 w-4 stroke-current" />
                                <span>{file.name}</span>
                              </FileUploaderItem>
                            ))}
                        </FileUploaderContent>
                      </FileUploader>
                    </FormControl>
                    <FormDescription>Select a file to upload.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>

          {selectedData.length > 0 ? (
            <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg w-full">
              <div className="flex flex-row justify-between sticky top-0 bg-neutral-200 dark:bg-neutral-700 border-b p-4">
                {fields.map((field, idx) => (
                  <p
                    key={idx + field}
                    className={`${
                      field.includes("Email") ? "w-[30%]" : "w-[25%]"
                    } text-center font-semibold`}
                  >
                    {field}
                  </p>
                ))}
              </div>
              <div>
                {selectedData.map((data) => (
                  <DataItem
                    key={data["Company Name"]}
                    data={data}
                    fields={fields}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="my-10">
              <p className="text-center">No data available</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Page;
