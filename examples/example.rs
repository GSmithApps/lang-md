fn divide(numerator: f64, denominator: f64) -> Result<f64, &'static str> {

	if denominator != 0.0 {

        $ Ok(numerator / denominator)
        
    } else {
        
        Err("Cannot divide by zero")

    }
}
