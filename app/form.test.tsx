

/* Vitest test for Form functionality testing */


import { describe, expect, it } from "vitest"

import { calculateTotal } from "@/app/form"


describe("Calculate Total Amounts", () => {
	it("Should handle basic cases", () => {
		expect(calculateTotal("100\n200")).toBe(300)
		expect(calculateTotal("100,200")).toBe(300)
		expect(calculateTotal("300")).toBe(300)
	})

	it("Should handle mixed dlimiters", () => {
		expect(calculateTotal("100\n200,300")).toBe(600)
		expect(calculateTotal("1.5,1.5")).toBe(3)
		expect(calculateTotal("300,,500\n\n200")).toBe(1000)
	})

	it("Should handle empty input", () => {
		expect(calculateTotal("")).toBe(0)
		expect(calculateTotal("\n\n\n,,,")).toBe(0)
	})

	it("Should ignore invalid numbers", () => {
		expect(calculateTotal("aaaaa,200")).toBe(200)
		expect(calculateTotal("12sffds,200")).toBe(212)
		expect(calculateTotal("100.10.30")).toBe(100.10)
	})

	it("Should ignore decimal numbers", () => {
		expect(calculateTotal("1.1,2.2,3.3")).toBe(6.6)
		expect(calculateTotal("99.99,0.01")).toBe(100)
	})

	it("Should handle whitespace", () => {
		expect(calculateTotal("100    \n   300")).toBe(400)
		expect(calculateTotal("\t\t\t200\n\n\r400")).toBe(600)
	})

	it("Should complex combinations", () => {
		expect(calculateTotal("100,asdadsads\n    \n   300")).toBe(400)
		expect(calculateTotal("asdadsd,,,\t\t\t200\n\n\r400")).toBe(600)
	})
})