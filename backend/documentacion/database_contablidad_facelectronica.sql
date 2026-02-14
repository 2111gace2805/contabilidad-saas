## Configuracion General para todas las compañias no require id_company
create table contabilidad.block_dtes
(
    id          int auto_increment
        primary key,
    type_dte    varchar(2)   null,
    correlativo varchar(15)  null,
    created_at  timestamp(1) null,
    updated_at  timestamp(1) null
)
    comment 'Se crea tabla para llevar un orden en los correlativos de DTE enviados a hacienda' engine = InnoDB
                                                                                                charset = utf8mb3;
create table contabilidad.condicion_operacion
(
    conop_id     varchar(255) not null,
    conop_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index conop_id
    on contabilidad.condicion_operacion (conop_id);

create table contabilidad.invoice_status_mh
(
    iemh_id      varchar(255) collate utf8mb4_general_ci not null
        primary key,
    iemh_mensaje varchar(255)                            null,
    iemh_estado  enum ('PROCESADO', 'RECHAZADO')         null
)
    engine = InnoDB
    charset = utf8mb3;

create table contabilidad.modelo_facturacion
(
    modfact_id     varchar(255) not null,
    modfact_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index modfact_id
    on contabilidad.modelo_facturacion (modfact_id);

create table contabilidad.unidades_medida
(
    unim_id     varchar(255) not null
        primary key,
    unim_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create table contabilidad.tipo_transmision
(
    tipotrans_id     varchar(255) not null
        primary key,
    tipotrans_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;


create table contabilidad.tipo_invalidacion
(
    id                       int auto_increment
        primary key,
    tipo_invalidacion_nombre varchar(150) null
)
    comment 'Tabla donde se guardan los tipos de invalidacion (Anulación) de DTE en MH' engine = InnoDB;

create table contabilidad.tipo_item
(
    tipoitem_id     varchar(255) not null
        primary key,
    tipoitem_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create table contabilidad.tipo_establecimiento
(
    tipoest_id     varchar(255) not null,
    tipoest_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index tipoest_id
    on contabilidad.tipo_establecimiento (tipoest_id);


create table contabilidad.tipo_invalidacion
(
    id                       int auto_increment
        primary key,
    tipo_invalidacion_nombre varchar(150) null
)
    comment 'Tabla donde se guardan los tipos de invalidacion (Anulación) de DTE en MH' engine = InnoDB
                                                                                        collate = utf8mb4_general_ci;

create table contabilidad.tipo_documento
(
    tipodoc_id     varchar(255)                                 not null,
    tipodoc_nombre varchar(255)                                 not null,
    tipodoc_estado enum ('Activo', 'Inactivo') default 'Activo' null,
    tipodoc_codigo varchar(255)                                 null,
    version_json   varchar(255)                                 null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index tipodoc_id
    on contabilidad.tipo_documento (tipodoc_id);


create table contabilidad.tipo_contingencia
(
    tconting_id     varchar(255) not null,
    tconting_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index tconting_id
    on contabilidad.tipo_contingencia (tconting_id);

create table contabilidad.recinto_fiscal
(
    refisc_id     varchar(255) not null,
    refisc_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index refisc_id
    on contabilidad.recinto_fiscal (refisc_id);

create table contabilidad.plazo
(
    plazo_id     varchar(255) not null,
    plazo_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index plazo_id
    on contabilidad.plazo (plazo_id);


create table contabilidad.forma_pago
(
    forp_id     varchar(255)                                 not null
        primary key,
    forp_nombre varchar(255)                                 not null,
    forp_status enum ('Active', 'Inactive') default 'Active' null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create table contabilidad.actividad_economica
(
    actie_id     varchar(255)                   not null
        primary key,
    actie_nombre varchar(255)                   not null,
    actie_padre  enum ('si', 'no') default 'no' null comment 'indica si es padre',
    actie_orden  int                            not null
)
    engine = InnoDB
    charset = utf8mb3;


create table contabilidad.paises
(
    pais_id     varchar(255) not null,
    pais_nombre varchar(255) not null,
    pais_code   varchar(191) null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index pais_id
    on contabilidad.paises (pais_id);

create table contabilidad.districts
(
    dist_id     bigint unsigned auto_increment
        primary key,
    munidepa_id int                                          null comment 'id del municipio',
    dist_name   varchar(191)                                 not null,
    dist_status enum ('Active', 'Inactive') default 'Active' not null,
    deleted_at  timestamp                                    null,
    created_at  timestamp                                    null,
    updated_at  timestamp                                    null,
    constraint districts_munidepa_id_foreign
        foreign key (munidepa_id) references contabilidad.municipios (munidepa_id)
            on update cascade on delete cascade
)
    comment 'ALIAS: dist' engine = InnoDB
                          collate = utf8mb4_unicode_ci;

create table contabilidad.municipios
(
    munidepa_id int auto_increment
        primary key,
    muni_id     varchar(255)                                 not null,
    muni_nombre varchar(255)                                 not null,
    depa_id     varchar(255)                                 not null,
    muni_status enum ('Active', 'Inactive') default 'Active' not null,
    deleted_at  timestamp                                    null,
    constraint municipios_ibfk_1
        foreign key (depa_id) references contabilidad.departamentos (depa_id)
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index depa_id
    on contabilidad.municipios (depa_id);

create index muni_id
    on contabilidad.municipios (muni_id);

create table contabilidad.departamentos
(
    depa_id     varchar(255) not null
        primary key,
    depa_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('00', 'Otro país');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('01', 'Ahuachapán');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('02', 'Santa Ana');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('03', 'Sonsonate');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('04', 'Chalatenango');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('05', 'La Libertad');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('06', 'San Salvador');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('07', 'Cuscatlán');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('08', 'La Paz');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('09', 'Cabañas');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('10', 'San Vicente');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('11', 'Usulután');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('12', 'San Miguel');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('13', 'Morazán');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('14', 'La Unión');
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (1, '00', 'Otro País', '00', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (2, '01', 'AHUACHAPÁN', '01', 'Inactive', null);
-- (file continues)
