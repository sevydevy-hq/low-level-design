import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * The small test runner every Java project carries, so no test library has to be installed.
 * Master copy: tools/runners/java/TestRunner.java. Every project's copy must be identical.
 *
 * Use it from a test class's main method:
 *
 *   TestRunner t = new TestRunner();
 *   t.test("starts at zero", () -> TestRunner.assertEquals(0, new Tally().count()));
 *   System.exit(t.run());
 *
 * It prints "PASS name" or "FAIL name :: reason" for each test, then "RESULT: x passed, y failed".
 */
public final class TestRunner {

    /** A test body. It may throw anything; any throw fails the test. */
    public interface Body {
        void run() throws Exception;
    }

    private final List<String> names = new ArrayList<>();
    private final List<Body> bodies = new ArrayList<>();

    /** Adds a test. Use the same name as the other languages' versions of this test. */
    public void test(String name, Body body) {
        names.add(name);
        bodies.add(body);
    }

    /** Runs every test in the order added, prints the results, and returns the exit code: 0 if all passed. */
    public int run() {
        int passed = 0;
        int failed = 0;
        for (int i = 0; i < names.size(); i++) {
            try {
                bodies.get(i).run();
                System.out.println("PASS " + names.get(i));
                passed++;
            } catch (Throwable t) {
                System.out.println("FAIL " + names.get(i) + " :: " + describe(t));
                failed++;
            }
        }
        System.out.println("RESULT: " + passed + " passed, " + failed + " failed");
        return failed == 0 ? 0 : 1;
    }

    public static void assertEquals(long expected, long actual) {
        if (expected != actual) {
            throw new AssertionError("expected " + expected + ", got " + actual);
        }
    }

    public static void assertEquals(Object expected, Object actual) {
        if (!Objects.equals(expected, actual)) {
            throw new AssertionError("expected " + expected + ", got " + actual);
        }
    }

    public static void assertTrue(boolean condition, String what) {
        if (!condition) {
            throw new AssertionError(what + " is false");
        }
    }

    /** Passes only if the body throws this type of exception (or a subtype). */
    public static void assertThrows(Class<? extends Throwable> type, Body body) {
        try {
            body.run();
        } catch (Throwable t) {
            if (type.isInstance(t)) {
                return;
            }
            throw new AssertionError("expected " + type.getSimpleName() + ", got " + describe(t));
        }
        throw new AssertionError("expected " + type.getSimpleName() + ", but nothing was thrown");
    }

    private static String describe(Throwable t) {
        String message = t.getMessage();
        if (t instanceof AssertionError) {
            return message;
        }
        return t.getClass().getSimpleName() + (message == null ? "" : ": " + message);
    }
}
