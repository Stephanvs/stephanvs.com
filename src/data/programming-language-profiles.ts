export interface Profile {
  summary: string;
  idea: string;
  strengths: string[];
  weaknesses: string[];
  reachFor: string;
  avoid: string;
  latest: string;
  recent: string;
  snippet: { lang: string; code: string };
}

export const sharedTask =
  'Total the paid orders per customer, then print customers from the highest total to the lowest.';

export const profiles: Record<string, Profile> = {
  c: {
    summary:
      'C gave Unix its portability, and Unix made C the default language of operating systems. Fifty years on, it still sits underneath nearly everything: kernels, databases, language runtimes, firmware, and the foreign-function interface every other language uses to talk to the outside world.',
    idea: 'Trust the programmer. C maps almost directly onto the machine and adds nothing you didn’t ask for.',
    strengths: [
      'Runs on everything with a CPU, from 8-bit microcontrollers to supercomputers.',
      'A small, stable language: code from the 1990s still compiles.',
      'The universal interface: every language can call C, and C can call anything.'
    ],
    weaknesses: [
      'No memory safety. A buffer overflow or use-after-free is one typo away.',
      'No standard build system, package manager or module system.',
      'Undefined behaviour lets compilers silently break code that looks correct.'
    ],
    reachFor: 'Firmware, kernels, drivers, and libraries that must be callable from every other language.',
    avoid: 'Anything that parses untrusted input or faces a network, unless you have the discipline and tooling of a security team.',
    latest: 'C23 (ISO/IEC 9899:2024)',
    recent:
      'C23 brought bool, nullptr, typeof and #embed into the standard, and GCC 15 now compiles C23 by default. The next revision, C2y, adds _Countof; defer is being developed as a separate technical specification.',
    snippet: {
      lang: 'c',
      code: String.raw`#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define LEN(a) (sizeof(a) / sizeof((a)[0]))

typedef struct { const char *customer; int amount; bool paid; } Order;
typedef struct { const char *customer; int total; } Total;

static int by_total_desc(const void *a, const void *b) {
    return ((const Total *)b)->total - ((const Total *)a)->total;
}

int main(void) {
    Order orders[] = {
        {"ada", 120, true}, {"grace", 75, true}, {"ada", 30, false},
        {"linus", 200, true}, {"grace", 25, true},
    };
    Total totals[LEN(orders)];
    size_t count = 0;

    for (size_t i = 0; i < LEN(orders); i++) {
        if (!orders[i].paid) continue;
        size_t j = 0;
        while (j < count && strcmp(totals[j].customer, orders[i].customer) != 0) j++;
        if (j == count) totals[count++] = (Total){orders[i].customer, 0};
        totals[j].total += orders[i].amount;
    }

    qsort(totals, count, sizeof totals[0], by_total_desc);
    for (size_t j = 0; j < count; j++)
        printf("%s %d\n", totals[j].customer, totals[j].total);
    return 0;
}`
    }
  },
  cpp: {
    summary:
      'C++ began as “C with Classes” and grew into the most feature-rich language in wide use. It powers game engines, browsers, databases, trading systems and most other performance-critical software, and it still gets a new standard every three years.',
    idea: 'Zero-overhead abstraction: what you don’t use, you don’t pay for, and what you do use, you couldn’t hand-code any better.',
    strengths: [
      'Top-tier performance with high-level abstractions on top.',
      'Unmatched ecosystem in games, graphics, finance and high-performance computing.',
      'Direct access to hardware and to every C library.'
    ],
    weaknesses: [
      'An enormous language with decades of overlapping features.',
      'Memory safety is a matter of discipline, not a guarantee.',
      'Builds and dependencies are a project of their own.'
    ],
    reachFor: 'Game engines, browsers, real-time and low-latency systems, and large existing C++ codebases.',
    avoid: 'New network-facing services where a memory-safe language would do, or small teams without C++ veterans.',
    latest: 'C++23; C++26 finalised in March 2026',
    recent:
      'C++26 was technically completed in March 2026 with static reflection, contracts, std::execution and a hardened standard library: the biggest release since C++11.',
    snippet: {
      lang: 'cpp',
      code: String.raw`#include <algorithm>
#include <map>
#include <print>
#include <string>
#include <utility>
#include <vector>

struct Order {
    std::string customer;
    int amount;
    bool paid;
};

int main() {
    const std::vector<Order> orders{
        {"ada", 120, true}, {"grace", 75, true}, {"ada", 30, false},
        {"linus", 200, true}, {"grace", 25, true},
    };

    std::map<std::string, int> totals;
    for (const auto& [customer, amount, paid] : orders)
        if (paid) totals[customer] += amount;

    std::vector<std::pair<std::string, int>> ranked(totals.begin(), totals.end());
    std::ranges::sort(ranked, std::greater{}, &std::pair<std::string, int>::second);
    for (const auto& [customer, total] : ranked)
        std::println("{} {}", customer, total);
}`
    }
  },
  rust: {
    summary:
      'Rust started as Graydon Hoare’s side project, was adopted by Mozilla, and reached 1.0 in 2015. It proved that a systems language can be memory-safe without a garbage collector, and it now ships in the Linux kernel, Android and Windows, and across the major cloud providers.',
    idea: 'Ownership: every value has exactly one owner and the compiler checks every borrow, so memory errors and data races become compile errors.',
    strengths: [
      'C-level speed, with memory and thread safety guaranteed at compile time.',
      'Cargo, Clippy, rustfmt and rust-analyzer: best-in-class tooling.',
      'An expressive type system with enums, pattern matching and traits.'
    ],
    weaknesses: [
      'A steep learning curve: the borrow checker changes how you design code.',
      'Slow compile times on large projects.',
      'Async Rust is powerful but adds a second layer of complexity.'
    ],
    reachFor: 'Systems software, CLIs, network services, embedded and WebAssembly, and anything replacing C or C++ where security matters.',
    avoid: 'Quick prototypes, exploratory data work, or teams that need to be productive this week.',
    latest: 'Rust 1.99 (October 2026)',
    recent:
      'The Linux kernel dropped Rust’s “experimental” label in December 2025. Google reported in late 2025 that memory-safety bugs had fallen below 20% of Android’s vulnerabilities, down from 76% in 2019, as new code moved to Rust.',
    snippet: {
      lang: 'rust',
      code: String.raw`use std::collections::HashMap;

struct Order {
    customer: &'static str,
    amount: u32,
    paid: bool,
}

fn main() {
    let orders = [
        Order { customer: "ada", amount: 120, paid: true },
        Order { customer: "grace", amount: 75, paid: true },
        Order { customer: "ada", amount: 30, paid: false },
        Order { customer: "linus", amount: 200, paid: true },
        Order { customer: "grace", amount: 25, paid: true },
    ];

    let mut totals: HashMap<&str, u32> = HashMap::new();
    for order in orders.iter().filter(|o| o.paid) {
        *totals.entry(order.customer).or_default() += order.amount;
    }

    let mut ranked: Vec<_> = totals.into_iter().collect();
    ranked.sort_by(|a, b| b.1.cmp(&a.1));
    for (customer, total) in ranked {
        println!("{customer} {total}");
    }
}`
    }
  },
  zig: {
    summary:
      'Zig is Andrew Kelley’s attempt at a better C: a small language with no hidden control flow, no hidden allocations and no preprocessor. It is still pre-1.0 and changes with each release, yet it already powers serious software, including the Bun runtime, the Ghostty terminal and the TigerBeetle database.',
    idea: 'Make everything explicit: allocators are passed in, errors are values, and compile-time code (comptime) replaces macros and generics.',
    strengths: [
      'A drop-in C compiler with seamless C interop.',
      'Cross-compiles to almost any target out of the box.',
      'comptime gives generics and metaprogramming in plain Zig.'
    ],
    weaknesses: [
      'Pre-1.0: expect breaking changes in every release.',
      'A small ecosystem and very few jobs.',
      'No memory-safety guarantees, only runtime checks in safe build modes.'
    ],
    reachFor: 'Performance-critical systems code, replacing C build toolchains, and projects where you want to control every allocation.',
    avoid: 'Anything that needs long-term API stability today, or a large hiring pool.',
    latest: 'Zig 0.17 (October 2026)',
    recent:
      'Zig 0.16 rebuilt I/O and async around a std.Io interface that is passed in like an allocator. 0.17 reworked the build system and moved C translation out of the compiler.',
    snippet: {
      lang: 'zig',
      code: String.raw`const std = @import("std");

const Order = struct { customer: []const u8, amount: u32, paid: bool };

pub fn main() !void {
    var debug_allocator: std.heap.DebugAllocator(.{}) = .init;
    defer _ = debug_allocator.deinit();
    const gpa = debug_allocator.allocator();

    const orders = [_]Order{
        .{ .customer = "ada", .amount = 120, .paid = true },
        .{ .customer = "grace", .amount = 75, .paid = true },
        .{ .customer = "ada", .amount = 30, .paid = false },
        .{ .customer = "linus", .amount = 200, .paid = true },
        .{ .customer = "grace", .amount = 25, .paid = true },
    };

    var totals: std.StringArrayHashMapUnmanaged(u32) = .empty;
    defer totals.deinit(gpa);

    for (orders) |order| {
        if (!order.paid) continue;
        const entry = try totals.getOrPutValue(gpa, order.customer, 0);
        entry.value_ptr.* += order.amount;
    }

    const ByTotal = struct {
        values: []const u32,
        pub fn lessThan(ctx: @This(), a: usize, b: usize) bool {
            return ctx.values[a] > ctx.values[b];
        }
    };
    totals.sort(ByTotal{ .values = totals.values() });

    for (totals.keys(), totals.values()) |customer, total| {
        std.debug.print("{s} {d}\n", .{ customer, total });
    }
}`
    }
  },
  odin: {
    summary:
      'Bill Hall, who goes by gingerBill, started Odin in 2016 as the language he wanted for his own graphics and tools work: C’s directness without its sharp edges. It has no hidden control flow, a small set of orthogonal features, and a compiler that doubles as the build system. It is still young and its community is small, but it is used for commercial software, including the visual-effects tools from JangaFX.',
    idea: 'Data-oriented design in the language itself: plain structs, explicit allocators passed through an implicit context, and built-in support for array programming and struct-of-arrays layouts.',
    strengths: [
      'Batteries for games and graphics: the bundled vendor: collection has bindings for OpenGL, Vulkan, raylib, SDL and more.',
      'Small and readable: parametric polymorphism, tagged unions and defer, without macros or exceptions.',
      'Built-in vector and matrix types, and #soa for struct-of-arrays layout.'
    ],
    weaknesses: [
      'Pre-1.0: the compiler ships as monthly dev builds, and breaking changes are possible.',
      'No package manager, and almost no ecosystem beyond what is bundled.',
      'Manual memory with no borrow checking: bounds checks help, but use-after-free is still on you.'
    ],
    reachFor: 'Games, graphics and native tools, and a calmer replacement for C in projects you control.',
    avoid: 'Anything that needs long-term API stability, a rich package ecosystem or a hiring pool.',
    latest: 'dev-2026-08 (monthly releases; no 1.0 yet)',
    recent:
      'The July 2026 build added a restricted -bedrock mode and stack canaries, and made PIE and full RELRO the Linux defaults. Odin scored 82% admired in Stack Overflow’s 2026 survey, but only about 34 respondents used it.',
    snippet: {
      lang: 'odin',
      code: String.raw`package main

import "core:fmt"
import "core:slice"

Order :: struct {
	customer: string,
	amount:   int,
	paid:     bool,
}

Total :: struct {
	customer: string,
	total:    int,
}

main :: proc() {
	orders := []Order{
		{"ada", 120, true},
		{"grace", 75, true},
		{"ada", 30, false},
		{"linus", 200, true},
		{"grace", 25, true},
	}

	totals := make(map[string]int)
	defer delete(totals)

	for order in orders {
		if order.paid {
			totals[order.customer] += order.amount
		}
	}

	ranked := make([dynamic]Total, 0, len(totals))
	defer delete(ranked)
	for customer, total in totals {
		append(&ranked, Total{customer, total})
	}

	slice.sort_by(ranked[:], proc(a, b: Total) -> bool {return a.total > b.total})

	for row in ranked {
		fmt.println(row.customer, row.total)
	}
}`
    }
  },
  java: {
    summary:
      'Java launched with “write once, run anywhere” and became the backbone of enterprise software, Android and big data. After a slow decade it now ships every six months, and recent releases have added records, pattern matching and virtual threads without breaking old code.',
    idea: 'A managed, portable runtime: the JVM handles memory, optimises hot code while it runs, and executes the same bytecode everywhere.',
    strengths: [
      'The JVM is one of the most heavily optimised runtimes ever built.',
      'A vast, mature ecosystem: Spring, Kafka, Hadoop, Android.',
      'Exceptional backward compatibility and tooling.'
    ],
    weaknesses: [
      'Verbose compared with newer languages, though less so every release.',
      'null is everywhere.',
      'A framework-heavy culture can bury simple code under configuration.'
    ],
    reachFor: 'Large backend systems, long-lived enterprise software, and data infrastructure.',
    avoid: 'Tiny CLIs or serverless functions where JVM start-up time matters, unless you compile ahead of time with GraalVM.',
    latest: 'JDK 27 (September 2026); JDK 25 is the current LTS',
    recent:
      'JDK 25 finalised compact source files and instance main methods, so a Java program no longer needs a class declaration; the snippet below uses them. Virtual threads, final since JDK 21, let plain blocking code scale like async code.',
    snippet: {
      lang: 'java',
      code: String.raw`import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summingInt;

record Order(String customer, int amount, boolean paid) {}

void main() {
    var orders = List.of(
        new Order("ada", 120, true),
        new Order("grace", 75, true),
        new Order("ada", 30, false),
        new Order("linus", 200, true),
        new Order("grace", 25, true));

    orders.stream()
        .filter(Order::paid)
        .collect(groupingBy(Order::customer, summingInt(Order::amount)))
        .entrySet().stream()
        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
        .forEach(e -> IO.println(e.getKey() + " " + e.getValue()));
}`
    }
  },
  csharp: {
    summary:
      'C# started as Microsoft’s answer to Java and has since out-evolved it, bringing async/await, LINQ and modern pattern matching to the mainstream. .NET is now open source and cross-platform, and C# runs everything from cloud services to Unity games.',
    idea: 'Pragmatic evolution: absorb proven ideas from functional languages into a familiar, productive object-oriented core.',
    strengths: [
      'A rich, steadily evolving language with excellent IDEs.',
      'A fast runtime, plus Native AOT for small, quick-starting binaries.',
      'One language for web, desktop, mobile, cloud and games.'
    ],
    weaknesses: [
      'A large surface area, with many ways to do the same thing.',
      'Still seen as Windows-centric, despite a decade of cross-platform .NET.',
      'Nullable reference types are warnings, not guarantees.'
    ],
    reachFor: 'Enterprise backends, Windows and cross-platform desktop apps, and games in Unity or Godot.',
    avoid: 'Environments the .NET runtime can’t reach, or teams wedded to the JVM ecosystem.',
    latest: 'C# 14 / .NET 10 LTS (November 2025)',
    recent:
      'C# 14 added extension members and the field keyword. .NET 10 runs a single .cs file with dotnet run app.cs, no project file needed, which is how the snippet below runs.',
    snippet: {
      lang: 'csharp',
      code: String.raw`var orders = new List<Order>
{
    new("ada", 120, true),
    new("grace", 75, true),
    new("ada", 30, false),
    new("linus", 200, true),
    new("grace", 25, true),
};

var totals =
    from order in orders
    where order.Paid
    group order.Amount by order.Customer into g
    let total = g.Sum()
    orderby total descending
    select (Customer: g.Key, Total: total);

foreach (var (customer, total) in totals)
    Console.WriteLine($"{customer} {total}");

record Order(string Customer, int Amount, bool Paid);`
    }
  },
  go: {
    summary:
      'Robert Griesemer, Rob Pike and Ken Thompson designed Go at Google to make large-scale server software simple to write and read. It became the language of cloud infrastructure: Docker, Kubernetes, Terraform and much of the cloud-native landscape are written in Go.',
    idea: 'Simplicity at scale: a small language, fast compiles, one formatting style, and concurrency built into the language.',
    strengths: [
      'Learn it in a week, then read anyone’s code.',
      'Goroutines and channels make concurrent servers straightforward.',
      'Single static binaries and very fast builds.'
    ],
    weaknesses: [
      'Verbose error handling: if err != nil, again and again.',
      'Deliberately limited expressiveness.',
      'nil pointers and data races are still possible.'
    ],
    reachFor: 'Network services, cloud infrastructure, CLIs and DevOps tooling.',
    avoid: 'GUI apps, numerical computing, or domains that reward rich type-level modelling.',
    latest: 'Go 1.27 (August 2026)',
    recent:
      'Go 1.26 made the Green Tea garbage collector the default, cutting GC overhead by 10–40%. Go 1.27 added generic methods and rebuilt encoding/json on top of json/v2.',
    snippet: {
      lang: 'go',
      code: String.raw`package main

import (
	"cmp"
	"fmt"
	"maps"
	"slices"
)

type Order struct {
	Customer string
	Amount   int
	Paid     bool
}

func main() {
	orders := []Order{
		{"ada", 120, true},
		{"grace", 75, true},
		{"ada", 30, false},
		{"linus", 200, true},
		{"grace", 25, true},
	}

	totals := map[string]int{}
	for _, o := range orders {
		if o.Paid {
			totals[o.Customer] += o.Amount
		}
	}

	customers := slices.SortedFunc(maps.Keys(totals), func(a, b string) int {
		return cmp.Compare(totals[b], totals[a])
	})
	for _, c := range customers {
		fmt.Println(c, totals[c])
	}
}`
    }
  },
  kotlin: {
    summary:
      'JetBrains created Kotlin to fix Java’s pain points while staying fully interoperable with it. Google made it the preferred language for Android in 2019, and Kotlin Multiplatform now shares code across Android, iOS, desktop and the web.',
    idea: 'A better Java, pragmatically: null safety, concise syntax and coroutines, with seamless access to every Java library.',
    strengths: [
      'Null safety built into the type system.',
      'Concise, expressive syntax that Java developers pick up quickly.',
      'Shares code across Android, iOS, server and web with Multiplatform.'
    ],
    weaknesses: [
      'Gradle builds can be slow and complicated.',
      'Outside Android, the community is far smaller than Java’s.',
      'Compile times are longer than Java’s.'
    ],
    reachFor: 'Android apps, shared mobile logic, and JVM backends where Java feels heavy.',
    avoid: 'Teams with no JVM experience who want a minimal toolchain.',
    latest: 'Kotlin 2.4 (June 2026)',
    recent:
      'Kotlin 2.4 made context parameters and explicit backing fields stable. Compose Multiplatform for iOS went stable in May 2025, so one UI codebase can now target both phones.',
    snippet: {
      lang: 'kotlin',
      code: String.raw`data class Order(val customer: String, val amount: Int, val paid: Boolean)

fun main() {
    val orders = listOf(
        Order("ada", 120, true),
        Order("grace", 75, true),
        Order("ada", 30, false),
        Order("linus", 200, true),
        Order("grace", 25, true),
    )

    orders.filter { it.paid }
        .groupingBy { it.customer }
        .fold(0) { total, order -> total + order.amount }
        .entries
        .sortedByDescending { it.value }
        .forEach { (customer, total) -> println("$customer $total") }
}`
    }
  },
  dart: {
    summary:
      'Google first pitched Dart as a replacement for JavaScript in the browser, and that never happened. Flutter rescued it: Dart’s JIT gives instant hot reload during development and its AOT compiler gives fast native release builds. It now ships apps on iOS, Android, the web and desktop.',
    idea: 'A language shaped for UI work: hot reload while you build, fast native code when you ship, and sound null safety throughout.',
    strengths: [
      'Stateful hot reload makes UI iteration very fast.',
      'Sound null safety and a clean, familiar syntax.',
      'One codebase for six platforms through Flutter.'
    ],
    weaknesses: [
      'The ecosystem is mostly Flutter.',
      'Little use outside Flutter, so few jobs outside it.',
      'Macros were cancelled in 2025, leaving code generation as the workaround.'
    ],
    reachFor: 'Cross-platform apps with a custom UI, built with Flutter.',
    avoid: 'Backend services, or anything Flutter isn’t part of.',
    latest: 'Dart 3.13 (August 2026)',
    recent:
      'The Dart team cancelled macros in January 2025 after years of work. Dot shorthands arrived in 3.10 and primary constructors in 3.13.',
    snippet: {
      lang: 'dart',
      code: String.raw`typedef Order = ({String customer, int amount, bool paid});

void main() {
  const List<Order> orders = [
    (customer: 'ada', amount: 120, paid: true),
    (customer: 'grace', amount: 75, paid: true),
    (customer: 'ada', amount: 30, paid: false),
    (customer: 'linus', amount: 200, paid: true),
    (customer: 'grace', amount: 25, paid: true),
  ];

  final totals = <String, int>{};
  for (final (:customer, :amount, :paid) in orders) {
    if (paid) {
      totals.update(customer, (sum) => sum + amount, ifAbsent: () => amount);
    }
  }

  final ranked = totals.entries.toList()
    ..sort((a, b) => b.value.compareTo(a.value));
  for (final MapEntry(:key, :value) in ranked) {
    print('$key $value');
  }
}`
    }
  },
  swift: {
    summary:
      'Apple introduced Swift in 2014 as a modern replacement for Objective-C. It combines value types, optionals and protocol-oriented design with native performance, and Swift 6 added compile-time data-race checking. It also runs on Linux, Windows, Android and microcontrollers, though most of its use is still on Apple platforms.',
    idea: 'Safe by default, fast by design: optionals instead of null, value types everywhere, and a compiler that catches data races.',
    strengths: [
      'Modern, safe and expressive syntax.',
      'Native performance with no garbage-collection pauses.',
      'First-class access to Apple’s frameworks.'
    ],
    weaknesses: [
      'Jobs and libraries are concentrated on Apple platforms.',
      'Language churn: Swift 6’s strict concurrency was a hard migration.',
      'Compile times, and Xcode, can frustrate.'
    ],
    reachFor: 'iOS, macOS, watchOS and visionOS apps.',
    avoid: 'Cross-platform products where Apple is one target among many, unless you’re betting on Swift’s newer Android and server support.',
    latest: 'Swift 6.4 (September 2026)',
    recent:
      'Swift 6.2 softened strict concurrency with “approachable concurrency” defaults. An official Android workgroup is building Android support, and Embedded Swift now targets microcontrollers.',
    snippet: {
      lang: 'swift',
      code: String.raw`struct Order {
    let customer: String
    let amount: Int
    let paid: Bool
}

let orders = [
    Order(customer: "ada", amount: 120, paid: true),
    Order(customer: "grace", amount: 75, paid: true),
    Order(customer: "ada", amount: 30, paid: false),
    Order(customer: "linus", amount: 200, paid: true),
    Order(customer: "grace", amount: 25, paid: true),
]

let totals = orders
    .filter(\.paid)
    .reduce(into: [String: Int]()) { $0[$1.customer, default: 0] += $1.amount }

for (customer, total) in totals.sorted(by: { $0.value > $1.value }) {
    print(customer, total)
}`
    }
  },
  javascript: {
    summary:
      'Brendan Eich wrote the first version of JavaScript in ten days in 1995. It became the only language every web browser runs, then spread to servers with Node.js, desktops with Electron and phones with React Native. It is still the most used language in most developer surveys.',
    idea: 'A dynamic, event-driven language with first-class functions, running wherever there is a browser engine.',
    strengths: [
      'Runs everywhere, with nothing for users to install.',
      'The largest package registry in the world.',
      'Fast JIT-compiled engines and a huge talent pool.'
    ],
    weaknesses: [
      'Weak typing and coercion quirks: [] + {} is a string.',
      'Tooling churn: bundlers, runtimes and package managers multiply.',
      'Deep dependency trees, and the supply-chain risk that comes with them.'
    ],
    reachFor: 'Anything that runs in a browser, small scripts, and full-stack web apps in one language.',
    avoid: 'Large codebases without types. Reach for TypeScript instead.',
    latest: 'ECMAScript 2026 (June 2026)',
    recent:
      'ES2026 added Math.sumPrecise, Error.isError and base64 helpers on Uint8Array. Temporal, the long-awaited replacement for Date, is finished and scheduled for ES2027.',
    snippet: {
      lang: 'javascript',
      code: String.raw`const orders = [
  { customer: "ada", amount: 120, paid: true },
  { customer: "grace", amount: 75, paid: true },
  { customer: "ada", amount: 30, paid: false },
  { customer: "linus", amount: 200, paid: true },
  { customer: "grace", amount: 25, paid: true },
];

const totals = new Map();
for (const { customer, amount, paid } of orders) {
  if (paid) totals.set(customer, (totals.get(customer) ?? 0) + amount);
}

[...totals]
  .sort(([, a], [, b]) => b - a)
  .forEach(([customer, total]) => console.log(customer, total));`
    }
  },
  php: {
    summary:
      'PHP began as Rasmus Lerdorf’s “Personal Home Page” tools and grew into the server language of the early web. It still runs a large share of all websites, every WordPress install among them. Modern PHP, with types, a JIT and frameworks like Laravel and Symfony, is a very different language from its reputation.',
    idea: 'Shared-nothing simplicity: every request starts fresh, so there is no state to leak and deploying is copying files.',
    strengths: [
      'Easy to host and deploy almost anywhere.',
      'Mature frameworks: Laravel, Symfony, WordPress.',
      'Modern PHP is fast and increasingly well typed.'
    ],
    weaknesses: [
      'An inconsistent standard library, inherited from its early years.',
      'Its reputation still lags behind reality, which affects hiring.',
      'Long-running and concurrent workloads need extensions such as Swoole.'
    ],
    reachFor: 'Content sites, e-commerce and CRUD web applications, especially with Laravel or WordPress.',
    avoid: 'Real-time systems, CPU-heavy work, or anything outside the web.',
    latest: 'PHP 8.5 (November 2025); 8.6 due November 2026',
    recent: 'PHP 8.4 added property hooks and asymmetric visibility. PHP 8.5 added the pipe operator (|>) and a built-in URI extension.',
    snippet: {
      lang: 'php',
      code: String.raw`<?php

final readonly class Order
{
    public function __construct(
        public string $customer,
        public int $amount,
        public bool $paid,
    ) {}
}

$orders = [
    new Order('ada', 120, true),
    new Order('grace', 75, true),
    new Order('ada', 30, false),
    new Order('linus', 200, true),
    new Order('grace', 25, true),
];

$totals = [];
foreach ($orders as $order) {
    if ($order->paid) {
        $totals[$order->customer] = ($totals[$order->customer] ?? 0) + $order->amount;
    }
}

arsort($totals);
foreach ($totals as $customer => $total) {
    echo "$customer $total\n";
}`
    }
  },
  typescript: {
    summary:
      'Anders Hejlsberg, who also designed C#, led the creation of TypeScript to make large JavaScript codebases manageable. Its structural, gradual type system won: most major frameworks now scaffold projects in TypeScript, and in 2025 it became the most used language on GitHub by monthly contributors.',
    idea: 'Describe JavaScript as people actually write it: a structural type system that models existing patterns, then disappears at runtime.',
    strengths: [
      'Catches whole categories of bugs before the code runs.',
      'A superb editor experience: completion, refactoring, navigation.',
      'Full access to the JavaScript ecosystem.'
    ],
    weaknesses: [
      'The type system is deliberately unsound, and any switches it off.',
      'Configuration and build setup add friction.',
      'Type-level code can become a puzzle of its own.'
    ],
    reachFor: 'Any JavaScript project bigger than a script: frontends, Node backends, libraries.',
    avoid: 'Tiny one-off scripts, or teams who will fight the compiler with any.',
    latest: 'TypeScript 7.0 (July 2026)',
    recent:
      'TypeScript 7.0 replaced the JavaScript-based compiler with a native port written in Go. It is roughly ten times faster on large codebases: type-checking VS Code’s 1.5 million lines dropped from 77.8 to 7.5 seconds.',
    snippet: {
      lang: 'typescript',
      code: String.raw`interface Order {
  customer: string;
  amount: number;
  paid: boolean;
}

const orders: Order[] = [
  { customer: "ada", amount: 120, paid: true },
  { customer: "grace", amount: 75, paid: true },
  { customer: "ada", amount: 30, paid: false },
  { customer: "linus", amount: 200, paid: true },
  { customer: "grace", amount: 25, paid: true },
];

const totals = orders
  .filter((order) => order.paid)
  .reduce<Record<string, number>>((acc, { customer, amount }) => {
    acc[customer] = (acc[customer] ?? 0) + amount;
    return acc;
  }, {});

Object.entries(totals)
  .sort(([, a], [, b]) => b - a)
  .forEach(([customer, total]) => console.log(customer, total));`
    }
  },
  python: {
    summary:
      'Guido van Rossum designed Python around readability, with significant indentation and a “batteries included” standard library. It became the default language for scripting, teaching, data science and machine learning, and in 2026 it leads almost every popularity ranking.',
    idea: 'There should be one obvious way to do it: readable code first, and when speed matters, call into C.',
    strengths: [
      'The gentlest learning curve of any mainstream language.',
      'An unrivalled ecosystem for data, ML and science: NumPy, pandas, PyTorch.',
      'Glue for everything: scripts, automation, APIs.'
    ],
    weaknesses: [
      'Slow in pure Python; the heavy lifting happens in C, C++ or Rust.',
      'The GIL kept threads off multiple cores for three decades.',
      'Packaging was painful for years, though uv is fixing it.'
    ],
    reachFor: 'Data analysis, machine learning, automation, scripting, and backends where developer time matters more than CPU time.',
    avoid: 'Mobile apps, browser code and CPU-bound hot paths.',
    latest: 'Python 3.15 (October 2026)',
    recent:
      'Python 3.14 made the free-threaded (no-GIL) build officially supported, though it is still opt-in. 3.15 adds explicit lazy imports and makes UTF-8 the default. Astral’s uv has become the fast default for environments and packages.',
    snippet: {
      lang: 'python',
      code: String.raw`from collections import Counter
from dataclasses import dataclass


@dataclass
class Order:
    customer: str
    amount: int
    paid: bool


orders = [
    Order("ada", 120, True),
    Order("grace", 75, True),
    Order("ada", 30, False),
    Order("linus", 200, True),
    Order("grace", 25, True),
]

totals = Counter()
for order in orders:
    if order.paid:
        totals[order.customer] += order.amount

for customer, total in totals.most_common():
    print(customer, total)`
    }
  },
  lua: {
    summary:
      'Lua was created at PUC-Rio in Brazil as a small, embeddable scripting language. The whole interpreter is a little portable C, so it lives inside other software: game engines, Roblox (as Luau), Neovim, Redis, nginx through OpenResty, and countless devices.',
    idea: 'Mechanisms, not policies: one data structure (the table), first-class functions, coroutines, and a clean C API for embedding.',
    strengths: [
      'Tiny, quick to embed and easy to sandbox.',
      'A simple language you can learn in an afternoon.',
      'LuaJIT is one of the fastest dynamic-language runtimes.'
    ],
    weaknesses: [
      'A thin standard library and ecosystem.',
      'Arrays start at 1 and variables are global by default.',
      'Fragmented versions: 5.1 (LuaJIT, Luau) versus 5.4 and 5.5.'
    ],
    reachFor: 'Scripting inside a game, editor or application you control.',
    avoid: 'Standalone applications that need a large standard library.',
    latest: 'Lua 5.5 (December 2025)',
    recent:
      'Lua 5.5 added explicit global declarations and a far more memory-efficient array representation. GitHub named Roblox’s Luau its fastest-growing language of 2025.',
    snippet: {
      lang: 'lua',
      code: String.raw`local orders = {
  { customer = "ada", amount = 120, paid = true },
  { customer = "grace", amount = 75, paid = true },
  { customer = "ada", amount = 30, paid = false },
  { customer = "linus", amount = 200, paid = true },
  { customer = "grace", amount = 25, paid = true },
}

local totals = {}
for _, order in ipairs(orders) do
  if order.paid then
    totals[order.customer] = (totals[order.customer] or 0) + order.amount
  end
end

local ranked = {}
for customer, total in pairs(totals) do
  ranked[#ranked + 1] = { customer = customer, total = total }
end
table.sort(ranked, function(a, b) return a.total > b.total end)

for _, row in ipairs(ranked) do
  print(row.customer, row.total)
end`
    }
  },
  ruby: {
    summary:
      'Yukihiro Matsumoto designed Ruby to make programmers happy, taking Smalltalk’s object model and Perl’s practicality. Ruby on Rails defined how web apps were built for a decade, and still powers GitHub, Shopify and many established companies.',
    idea: 'Everything is an object, and the language bends to the programmer: blocks, open classes and metaprogramming make DSLs natural.',
    strengths: [
      'Beautiful, expressive syntax.',
      'Rails is still one of the fastest ways to ship a web product.',
      'Strong conventions and a strong testing culture.'
    ],
    weaknesses: [
      'Slower than compiled languages, although YJIT helps.',
      'A shrinking community and job market.',
      'Metaprogramming can make large codebases hard to follow.'
    ],
    reachFor: 'Web products and startups that want Rails’ conventions and speed of delivery.',
    avoid: 'CPU-bound or highly concurrent workloads.',
    latest: 'Ruby 4.0 (December 2025)',
    recent:
      'Ruby 4.0 shipped on the language’s 30th anniversary with ZJIT, an experimental successor to YJIT, and Ruby::Box for isolating code.',
    snippet: {
      lang: 'ruby',
      code: String.raw`Order = Data.define(:customer, :amount, :paid)

orders = [
  Order.new("ada", 120, true),
  Order.new("grace", 75, true),
  Order.new("ada", 30, false),
  Order.new("linus", 200, true),
  Order.new("grace", 25, true),
]

orders
  .select(&:paid)
  .group_by(&:customer)
  .transform_values { |list| list.sum(&:amount) }
  .sort_by { |_, total| -total }
  .each { |customer, total| puts "#{customer} #{total}" }`
    }
  },
  r: {
    summary:
      'Ross Ihaka and Robert Gentleman created R as an open-source take on the S language for statistics. It is the working language of statisticians, epidemiologists and bioinformaticians, with more than twenty thousand packages on CRAN and thousands more on Bioconductor.',
    idea: 'Analysis as a conversation: vectors, data frames and model formulas are built in, and every statistical method is a function call away.',
    strengths: [
      'The deepest library of statistical methods anywhere.',
      'ggplot2 and the tidyverse set the standard for data workflows.',
      'Excellent for reproducible reports with R Markdown and Quarto.'
    ],
    weaknesses: [
      'Quirky, inconsistent language design.',
      'Slow and memory-hungry on large data without specialised packages.',
      'Little use outside data analysis.'
    ],
    reachFor: 'Statistics, biostatistics, academic research and exploratory analysis.',
    avoid: 'Production services, or anything that isn’t analysis.',
    latest: 'R 4.6 (April 2026)',
    recent:
      'R 4.6 made C++20 the default standard for compiled package code. Posit’s Positron IDE is giving R a modern, polyglot development environment.',
    snippet: {
      lang: 'r',
      code: String.raw`orders <- data.frame(
  customer = c("ada", "grace", "ada", "linus", "grace"),
  amount   = c(120, 75, 30, 200, 25),
  paid     = c(TRUE, TRUE, FALSE, TRUE, TRUE)
)

paid_orders <- orders[orders$paid, ]
totals <- aggregate(amount ~ customer, data = paid_orders, FUN = sum)
totals[order(-totals$amount), ]`
    }
  },
  julia: {
    summary:
      'Julia was created at MIT to solve the two-language problem: prototyping in Python or MATLAB, then rewriting in C for speed. It compiles each function for the argument types it is called with, so high-level numerical code runs close to native speed.',
    idea: 'Multiple dispatch: functions specialise on the types of all their arguments, so generic numerical code is both composable and fast.',
    strengths: [
      'Near-C speed for numerical code without leaving the language.',
      'Multiple dispatch makes libraries compose unusually well.',
      'Excellent for differential equations, optimisation and GPU computing.'
    ],
    weaknesses: [
      'Compilation latency (“time to first plot”), although much improved.',
      'A small ecosystem and job market outside science.',
      'Hard to ship as a small standalone binary.'
    ],
    reachFor: 'Scientific computing, simulation, optimisation, and research code that has to be fast.',
    avoid: 'General web or mobile development, or teams that need a large hiring pool.',
    latest: 'Julia 1.13 (2026)',
    recent: 'Julia 1.12 added an experimental --trim option for much smaller compiled binaries. In October 2026 Julia returned to TIOBE’s top 20.',
    snippet: {
      lang: 'julia',
      code: String.raw`struct Order
    customer::String
    amount::Int
    paid::Bool
end

orders = [
    Order("ada", 120, true),
    Order("grace", 75, true),
    Order("ada", 30, false),
    Order("linus", 200, true),
    Order("grace", 25, true),
]

totals = Dict{String,Int}()
for o in orders
    o.paid && (totals[o.customer] = get(totals, o.customer, 0) + o.amount)
end

for (customer, total) in sort(collect(totals); by = last, rev = true)
    println(customer, " ", total)
end`
    }
  },
  haskell: {
    summary:
      'Haskell was designed by a committee in 1990 to consolidate research on lazy functional languages. Its influence far exceeds its usage: type classes, monads and much of what makes Rust, Swift, Scala and modern C# expressive can be traced back to it.',
    idea: 'Purity and types: a function has no side effects unless its type says so, and the compiler checks the rest.',
    strengths: [
      'A powerful type system that rules out entire classes of bugs.',
      'Fearless refactoring: if it compiles, it usually works.',
      'Excellent concurrency, with software transactional memory.'
    ],
    weaknesses: [
      'A steep learning curve full of abstract concepts.',
      'Laziness makes performance and memory use hard to predict.',
      'A small job market and uneven library quality.'
    ],
    reachFor: 'Compilers, financial systems, and domains where correctness matters more than hiring.',
    avoid: 'Teams without functional programming experience who are under delivery pressure.',
    latest: 'GHC 9.14 (December 2025)',
    recent: 'GHC adopted a long-term-support release policy in 2025, and 9.14 is its first LTS release.',
    snippet: {
      lang: 'haskell',
      code: String.raw`import Data.List (sortOn)
import qualified Data.Map.Strict as Map
import Data.Ord (Down (..))

data Order = Order {customer :: String, amount :: Int, paid :: Bool}

orders :: [Order]
orders =
  [ Order "ada" 120 True,
    Order "grace" 75 True,
    Order "ada" 30 False,
    Order "linus" 200 True,
    Order "grace" 25 True
  ]

main :: IO ()
main = mapM_ (\(name, total) -> putStrLn (name ++ " " ++ show total)) ranked
  where
    totals = Map.fromListWith (+) [(customer o, amount o) | o <- orders, paid o]
    ranked = sortOn (Down . snd) (Map.toList totals)`
    }
  },
  scala: {
    summary:
      'Martin Odersky created Scala at EPFL to unify object-oriented and functional programming on the JVM. It powered the big-data wave through Apache Spark and the early Kafka, and Scala 3 redesigned the language with cleaner syntax on a new theoretical foundation.',
    idea: 'Objects and functions are two sides of one coin, and a strong type system lets you express both precisely.',
    strengths: [
      'An extremely expressive type system and syntax.',
      'Full access to the JVM ecosystem.',
      'Strong in data engineering (Spark) and effect systems (ZIO, Cats Effect).'
    ],
    weaknesses: [
      'Complexity: many paradigms and many ways to write the same thing.',
      'The move from Scala 2 to Scala 3 split the community.',
      'A shrinking job market as Kotlin and Java improved.'
    ],
    reachFor: 'Data engineering with Spark, and teams that want advanced functional programming on the JVM.',
    avoid: 'Teams that need a simple, uniform codebase.',
    latest: 'Scala 3.9 LTS (September 2026)',
    recent: 'Scala 3.9 is the new long-term-support release, and 3.8 shipped a standard library compiled with Scala 3 itself.',
    snippet: {
      lang: 'scala',
      code: String.raw`case class Order(customer: String, amount: Int, paid: Boolean)

@main def report(): Unit =
  val orders = List(
    Order("ada", 120, true),
    Order("grace", 75, true),
    Order("ada", 30, false),
    Order("linus", 200, true),
    Order("grace", 25, true),
  )

  orders
    .filter(_.paid)
    .groupMapReduce(_.customer)(_.amount)(_ + _)
    .toList
    .sortBy(-_._2)
    .foreach((customer, total) => println(s"$customer $total"))`
    }
  },
  fsharp: {
    summary:
      'Don Syme at Microsoft Research brought the ML family to .NET with F#. It is functional-first, with type inference, discriminated unions and pipelines, and can still use every .NET library. It has a loyal following in finance and other data-heavy domains.',
    idea: 'Make illegal states unrepresentable: model the domain with types, and compose behaviour with pipelines.',
    strengths: [
      'Concise, readable functional code with strong type inference.',
      'All of .NET available, plus excellent scripting with .fsx files.',
      'A natural fit for domain modelling.'
    ],
    weaknesses: [
      'A small community, and only modest investment from Microsoft.',
      'Tooling trails C#.',
      'Few jobs outside finance and specialist shops.'
    ],
    reachFor: 'Domain-heavy backends, financial modelling, data scripts, and .NET teams who want functional programming.',
    avoid: 'Organisations that need to hire many developers quickly.',
    latest: 'F# 10 / .NET 10 (November 2025)',
    recent: 'F# 9 added nullable reference types for safer .NET interop. F# 10 brought parallel compilation in preview and scoped warning control.',
    snippet: {
      lang: 'fsharp',
      code: String.raw`type Order = { Customer: string; Amount: int; Paid: bool }

let orders =
    [ { Customer = "ada"; Amount = 120; Paid = true }
      { Customer = "grace"; Amount = 75; Paid = true }
      { Customer = "ada"; Amount = 30; Paid = false }
      { Customer = "linus"; Amount = 200; Paid = true }
      { Customer = "grace"; Amount = 25; Paid = true } ]

orders
|> List.filter _.Paid
|> List.groupBy _.Customer
|> List.map (fun (customer, items) -> customer, List.sumBy _.Amount items)
|> List.sortByDescending snd
|> List.iter (fun (customer, total) -> printfn $"{customer} {total}")`
    }
  },
  clojure: {
    summary:
      'Rich Hickey designed Clojure as a practical Lisp for the JVM, built around immutable, persistent data structures. It is small, remarkably stable and loved by teams that value simplicity. Nubank, one of the world’s largest digital banks, runs on it.',
    idea: 'Simple made easy: plain immutable data, pure functions, and a REPL that lets you change a running program.',
    strengths: [
      'Immutable data by default makes concurrency far safer.',
      'REPL-driven development is fast and interactive.',
      'Exceptionally stable: old code keeps working.'
    ],
    weaknesses: [
      'Lisp syntax is a barrier for many developers.',
      'Error messages and stack traces can be cryptic.',
      'A small hiring pool.'
    ],
    reachFor: 'Data-oriented backends, and teams that want simplicity and interactive development.',
    avoid: 'Teams that want static types or a large pool of candidates.',
    latest: 'Clojure 1.12 (1.13 in alpha)',
    recent: 'Clojure 1.12 overhauled Java interop, including method values and better support for functional interfaces. The 1.13 alphas add destructuring with required keys.',
    snippet: {
      lang: 'clojure',
      code: String.raw`(def orders
  [{:customer "ada"   :amount 120 :paid true}
   {:customer "grace" :amount 75  :paid true}
   {:customer "ada"   :amount 30  :paid false}
   {:customer "linus" :amount 200 :paid true}
   {:customer "grace" :amount 25  :paid true}])

(->> orders
     (filter :paid)
     (group-by :customer)
     (map (fn [[customer os]] [customer (reduce + (map :amount os))]))
     (sort-by second >)
     (run! (fn [[customer total]] (println customer total))))`
    }
  },
  elixir: {
    summary:
      'José Valim, then a Rails core team member, built Elixir on the BEAM, the runtime Ericsson created for telephone switches that could not go down. Elixir added friendly syntax, macros and modern tooling, and Phoenix with LiveView made it a strong choice for real-time web apps.',
    idea: 'Let it crash: millions of isolated processes, watched by supervisors that restart them, so failures stay small and local.',
    strengths: [
      'Concurrency and fault tolerance are built into the runtime.',
      'Phoenix LiveView builds real-time interfaces with little JavaScript.',
      'Friendly syntax, excellent documentation and tooling.'
    ],
    weaknesses: [
      'Slower than compiled languages for CPU-bound work.',
      'A smaller ecosystem and job market.',
      'Static typing is only now arriving.'
    ],
    reachFor: 'Real-time web apps, chat, IoT backends, and systems that must stay up.',
    avoid: 'Number crunching, or teams that need a large hiring pool.',
    latest: 'Elixir 1.20 (June 2026)',
    recent: 'Elixir 1.20’s compiler infers types and gradually type-checks every program, using set-theoretic types, with no annotations required.',
    snippet: {
      lang: 'elixir',
      code: String.raw`orders = [
  %{customer: "ada", amount: 120, paid: true},
  %{customer: "grace", amount: 75, paid: true},
  %{customer: "ada", amount: 30, paid: false},
  %{customer: "linus", amount: 200, paid: true},
  %{customer: "grace", amount: 25, paid: true}
]

orders
|> Enum.filter(& &1.paid)
|> Enum.group_by(& &1.customer, & &1.amount)
|> Enum.map(fn {customer, amounts} -> {customer, Enum.sum(amounts)} end)
|> Enum.sort_by(fn {_customer, total} -> total end, :desc)
|> Enum.each(fn {customer, total} -> IO.puts("#{customer} #{total}") end)`
    }
  },
  gleam: {
    summary:
      'Gleam, created by Louis Pilfold, brings a small, statically typed functional language to the Erlang VM, and can also compile to JavaScript. It reached 1.0 in March 2024 and has grown quickly from a tiny base, helped by famously friendly error messages and tooling.',
    idea: 'Simplicity and safety: no null, no exceptions, no macros, one obvious way to do things, on a runtime built for concurrency.',
    strengths: [
      'Sound static types with full inference.',
      'Batteries-included tooling in a single binary.',
      'Runs on the BEAM or in the browser.'
    ],
    weaknesses: [
      'Young: a small ecosystem and almost no jobs.',
      'Deliberately minimal, so some patterns take more code.',
      'Integration with Erlang’s OTP is still maturing.'
    ],
    reachFor: 'Typed services on the BEAM, and developers curious about functional programming.',
    avoid: 'Projects that need many mature libraries, or easy hiring.',
    latest: 'Gleam 1.19 (October 2026)',
    recent: 'Gleam 1.19 compiles to Erlang abstract forms instead of Erlang source, for faster builds and accurate stack traces.',
    snippet: {
      lang: 'gleam',
      code: String.raw`import gleam/dict
import gleam/int
import gleam/io
import gleam/list
import gleam/option.{None, Some}

pub type Order {
  Order(customer: String, amount: Int, paid: Bool)
}

pub fn main() {
  let orders = [
    Order("ada", 120, True),
    Order("grace", 75, True),
    Order("ada", 30, False),
    Order("linus", 200, True),
    Order("grace", 25, True),
  ]

  orders
  |> list.filter(fn(order) { order.paid })
  |> list.fold(dict.new(), fn(totals, order) {
    dict.upsert(totals, order.customer, fn(current) {
      case current {
        Some(total) -> total + order.amount
        None -> order.amount
      }
    })
  })
  |> dict.to_list
  |> list.sort(fn(a, b) { int.compare(b.1, a.1) })
  |> list.each(fn(pair) { io.println(pair.0 <> " " <> int.to_string(pair.1)) })
}`
    }
  }
};

export function lineCount(code: string) {
  return code.split('\n').filter((line) => line.trim() !== '').length;
}
