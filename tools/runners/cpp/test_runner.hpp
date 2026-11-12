// The small test runner every C++ project carries, so no test library has to be installed.
// Master copy: tools/runners/cpp/test_runner.hpp. Every project's copy must be identical.
//
// Use it in a test file:
//
//   #include "test_runner.hpp"
//   TEST("starts at zero") { Tally t; CHECK_EQ(0, t.count()); }
//   int main() { return test_runner::run_all(); }
//
// It prints "PASS name" or "FAIL name :: reason" for each test, then "RESULT: x passed, y failed".
// CHECK_EQ needs values that can be printed with <<.

#pragma once

#include <exception>
#include <functional>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

namespace test_runner {

struct Failure : std::runtime_error {
    using std::runtime_error::runtime_error;
};

inline std::vector<std::pair<std::string, std::function<void()>>>& registry() {
    static std::vector<std::pair<std::string, std::function<void()>>> tests;
    return tests;
}

struct Register {
    Register(const std::string& name, std::function<void()> body) {
        registry().emplace_back(name, std::move(body));
    }
};

inline int run_all() {
    int passed = 0;
    int failed = 0;
    for (auto& test : registry()) {
        try {
            test.second();
            std::cout << "PASS " << test.first << "\n";
            ++passed;
        } catch (const std::exception& e) {
            std::cout << "FAIL " << test.first << " :: " << e.what() << "\n";
            ++failed;
        } catch (...) {
            std::cout << "FAIL " << test.first << " :: unknown exception\n";
            ++failed;
        }
    }
    std::cout << "RESULT: " << passed << " passed, " << failed << " failed\n";
    return failed == 0 ? 0 : 1;
}

template <class Expected, class Actual>
void check_equal(const Expected& expected, const Actual& actual, int line) {
    if (!(expected == actual)) {
        std::ostringstream message;
        message << "line " << line << ": expected " << expected << ", got " << actual;
        throw Failure(message.str());
    }
}

}  // namespace test_runner

#define TEST_RUNNER_CAT2(a, b) a##b
#define TEST_RUNNER_CAT(a, b) TEST_RUNNER_CAT2(a, b)

// TEST("name") { ...body... }  Use the same name as the other languages' versions of this test.
#define TEST(name)                                                            \
    static void TEST_RUNNER_CAT(test_runner_body_, __LINE__)();               \
    static test_runner::Register TEST_RUNNER_CAT(test_runner_reg_, __LINE__)( \
        name, TEST_RUNNER_CAT(test_runner_body_, __LINE__));                  \
    static void TEST_RUNNER_CAT(test_runner_body_, __LINE__)()

#define CHECK_EQ(expected, actual) test_runner::check_equal((expected), (actual), __LINE__)

#define CHECK(condition)                                                                    \
    do {                                                                                    \
        if (!(condition))                                                                   \
            throw test_runner::Failure("line " + std::to_string(__LINE__) + ": " #condition \
                                       " is false");                                        \
    } while (0)

// Passes only if the expression throws this exception type (or a subtype).
#define CHECK_THROWS_AS(expression, type)                                                    \
    do {                                                                                     \
        bool test_runner_thrown = false;                                                     \
        try {                                                                                \
            (void)(expression);                                                              \
        } catch (const type&) {                                                              \
            test_runner_thrown = true;                                                       \
        } catch (...) {                                                                      \
            throw test_runner::Failure("line " + std::to_string(__LINE__) +                  \
                                       ": threw something other than " #type);              \
        }                                                                                    \
        if (!test_runner_thrown)                                                             \
            throw test_runner::Failure("line " + std::to_string(__LINE__) + ": expected " #type \
                                       ", but nothing was thrown");                          \
    } while (0)
