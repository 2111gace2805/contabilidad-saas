p='backend/app/Http/Controllers/Api/SuperAdminController.php'
with open(p,'r',encoding='utf-8') as f:
    s=f.read()
target="        return response()->json(['message' => 'Company deleted successfully']);\n    }\n"
if target in s:
    method='''

    public function disableCompany($id)
    {
        $company = Company::findOrFail($id);
        $hasTransactions = $this->companyHasTransactions($company);

        if ($hasTransactions) {
            return response()->json([
                'message' => 'No se puede deshabilitar esta empresa porque tiene transacciones.'
            ], 422);
        }

        $company->active = false;
        $company->save();

        return response()->json(['message' => 'Company disabled successfully', 'company' => $company]);
    }
'''
    s=s.replace(target, target+method)
    with open(p,'w',encoding='utf-8') as f:
        f.write(s)
    print('inserted')
else:
    print('pattern not found')
