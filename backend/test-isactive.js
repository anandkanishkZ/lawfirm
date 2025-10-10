// Test isActive logic
const isActive1 = true;  // Default value from req.query
const isActive2 = 'true';  // String value from query params

console.log('Test 1 - Boolean true:');
console.log('  Old logic:', isActive1 === 'true'); // false ❌
console.log('  New logic:', isActive1 === 'true' || isActive1 === true); // true ✅

console.log('\nTest 2 - String "true":');
console.log('  Old logic:', isActive2 === 'true'); // true ✅
console.log('  New logic:', isActive2 === 'true' || isActive2 === true); // true ✅

console.log('\nTest 3 - Boolean false:');
const isActive3 = false;
console.log('  Old logic:', isActive3 === 'true'); // false ✅
console.log('  New logic:', isActive3 === 'true' || isActive3 === true); // false ✅

console.log('\nTest 4 - String "false":');
const isActive4 = 'false';
console.log('  Old logic:', isActive4 === 'true'); // false ✅
console.log('  New logic:', isActive4 === 'true' || isActive4 === true); // false ✅
