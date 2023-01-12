import ExpenseStatistics from "~/components/expenses/ExpenseStatistics";
import Chart from "~/components/expenses/Chart";
import { getExpenses } from "~/data/expenses.server";
import { useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import Error from "~/components/util/Error";

export default function ExpensesAnalysisPage() {
  const expenses = useLoaderData();

  return (
    <main>
      <Chart expenses={expenses} />
      <ExpenseStatistics expenses={expenses} />
    </main>
  );
}

export async function loader() {
  const expenses = await getExpenses();

  if (!expenses || expenses.length === 0) {
    throw json(
      { message: "Couldn't find any Expenses" },
      { status: 404, statusText: "No expenses found." }
    );
  }

  return expenses;
}

export function CatchBoundary() {
  const caughtBoundary = useCatch();

  return (
    <main>
      <Error title={caughtBoundary.statusText}>
        <p>{caughtBoundary.data?.message || "Couldn't find any Expenses"}</p>
      </Error>
    </main>
  );
}
