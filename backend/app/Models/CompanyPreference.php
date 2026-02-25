<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'primary_color',
        'dte_establishment_code',
        'dte_point_of_sale_code',
        'emisor_nombre_comercial',
        'emisor_tipo_establecimiento',
        'emisor_correo',
        'emisor_cod_actividad',
        'emisor_desc_actividad',
        'emisor_departamento',
        'emisor_municipio',
        'emisor_distrito',
        'emisor_direccion_complemento',
        'emisor_cod_estable',
        'emisor_cod_punto_venta',
        'firmador_certificate_name',
        'firmador_certificate_content',
        'firmador_private_key_name',
        'firmador_private_key_content',
        'firmador_api_password',
        'firmador_api_url',
        'smtp_provider',
        'smtp_url',
        'smtp_api_key',
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'smtp_encryption',
        'smtp_region',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
