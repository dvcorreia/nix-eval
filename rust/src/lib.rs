use std::fmt::Write;

use tvix_eval::observer::{DisassemblingObserver, TracingObserver};
use wasm_bindgen::prelude::*;

#[derive(Default)]
struct Output {
    errors: String,
    warnings: String,
    output: String,
    bytecode: Vec<u8>,
    trace: Vec<u8>,
    ast: String,
}

fn eval(source: &str, location: &str, strict: bool) -> Output {
    let mut output = Output::default();
    let mut builder = tvix_eval::Evaluation::builder_pure();
    let source_map = builder.source_map().clone();

    let result = {
        let mut compiler_observer =
            DisassemblingObserver::new(source_map.clone(), &mut output.bytecode);
        builder.set_compiler_observer(Some(&mut compiler_observer));

        let mut runtime_observer = TracingObserver::new(&mut output.trace);
        builder.set_runtime_observer(Some(&mut runtime_observer));

        builder
            .mode(if strict {
                tvix_eval::EvalMode::Strict
            } else {
                tvix_eval::EvalMode::Lazy
            })
            .build()
            .evaluate(source, Some(location.into()))
    };

    if let Some(expr) = &result.expr {
        output.ast = tvix_eval::pretty_print_expr(expr);
    }

    output.output = result
        .value
        .map_or_else(String::new, |value| value.to_string());

    for warning in result.warnings {
        writeln!(
            &mut output.warnings,
            "{}\n",
            warning.fancy_format_str(&source_map).trim(),
        )
        .expect("writing to a String cannot fail");
    }

    for error in result.errors {
        writeln!(&mut output.errors, "{}\n", error.fancy_format_str().trim(),)
            .expect("writing to a String cannot fail");
    }

    output
}

#[wasm_bindgen(js_name = evaluate)]
pub fn eval_wasm(source: &str, location: &str, strict: bool) -> String {
    let output = eval(source, location, strict);
    serde_json::json!({
        "errors": output.errors,
        "warnings": output.warnings,
        "output": output.output,
        "bytecode": String::from_utf8_lossy(&output.bytecode),
        "trace": String::from_utf8_lossy(&output.trace),
        "ast": output.ast,
    })
    .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn evaluates_a_pure_expression() {
        let result = eval("6 * 7", "/input.nix", false);

        assert_eq!(result.output, "42");
        assert!(result.warnings.is_empty());
        assert!(result.errors.is_empty());
        assert!(!result.bytecode.is_empty());
        assert!(!result.trace.is_empty());
        assert!(!result.ast.is_empty());
    }

    #[test]
    fn returns_parse_errors_as_data() {
        let result = eval("let", "/input.nix", false);

        assert!(result.output.is_empty());
        assert!(result.warnings.is_empty());
        assert!(!result.errors.is_empty());
        assert!(result.ast.is_empty());
    }

    #[test]
    fn serializes_output_for_wasm() {
        let output: serde_json::Value =
            serde_json::from_str(&eval_wasm("6 * 7", "/input.nix", false)).unwrap();

        assert_eq!(output["output"], "42");
    }

    #[test]
    fn strict_evaluation_forces_nested_values() {
        let source = "{ value = builtins.concatStringsSep \"\" [ \"hello\" \" world\" ]; }";

        assert!(eval(source, "/input.nix", false).output.contains("<CODE>"));
        let strict_output = eval(source, "/input.nix", true).output;
        assert!(
            strict_output.contains("hello world"),
            "unexpected strict output: {strict_output}"
        );
    }
}
