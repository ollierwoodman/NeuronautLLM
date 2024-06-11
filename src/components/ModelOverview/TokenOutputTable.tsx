import { MultipleTopKDerivedScalarsResponseData } from "@/client";
import { DataTable } from "../ui/DataTable";
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "../ui/button";

type TokenOutputTableDataRow = {
  token: string;
  logit: number;
  probability: number;
}

export const columns: ColumnDef<TokenOutputTableDataRow>[] = [
  {
    accessorKey: "token",
    header: ({ column }) => {
      return (
        <Button
          className="p-0"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Token
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="text-left font-mono px-1">{row.getValue("token")}</div>
    },
  },
  {
    accessorKey: "logit",
    header: ({ column }) => {
      return (
        <Button
          className="p-0"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Logit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="text-right font-mono px-1">{parseFloat(row.getValue("logit")).toFixed(2)}</div>
    },
  },
  {
    accessorKey: "probability",
    header: "Probability",
    cell: ({ row }) => {
      const probability = row.getValue("probability") as number;
      return <div className="text-right font-mono px-1">{`${(probability * 100).toFixed(2)}%`}</div>
    },
  },
]

type TokenOutputTableProps = {
  topOutputTokenLogits: MultipleTopKDerivedScalarsResponseData;
  softmaxedLogits: number[];
};

export const TokenOutputTable: React.FC<TokenOutputTableProps> = ({
  topOutputTokenLogits,
  softmaxedLogits,
}) => {
  const nextTokenCandidates = topOutputTokenLogits.vocabTokenStringsForIndices;

  const data: TokenOutputTableDataRow[] = nextTokenCandidates?.map((token, index) => {
    return {
      token: token,
      logit: topOutputTokenLogits.activationsByGroupId["logits"][index],
      probability: softmaxedLogits[index],
    }
  }) || [];

  return (
    <>
      <DataTable columns={columns} data={data} />
    </>
  )
}