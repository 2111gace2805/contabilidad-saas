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

create table contabilidad.departamentos
(
    depa_id     varchar(255) not null
        primary key,
    depa_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;


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
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (3, '01', 'CANDELARIA DE LA FRONTERA', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (4, '01', 'ACAJUTLA', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (5, '01', 'AGUA CALIENTE', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (6, '01', 'ANTGO CUSCATLÁN', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (7, '01', 'AGUILARES', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (8, '01', 'CANDELARIA', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (9, '01', 'CUYULTITÁN', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (10, '01', 'CINQUERA', '09', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (11, '01', 'APASTEPEQUE', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (12, '01', 'ALEGRÍA', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (13, '01', 'CAROLINA', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (14, '01', 'ARAMBALA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (15, '01', 'ANAMOROS', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (16, '02', 'APANECA', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (17, '02', 'COATEPEQUE', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (18, '02', 'ARMENIA', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (19, '02', 'ARCATAO', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (20, '02', 'CIUDAD ARCE', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (21, '02', 'APOPA', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (22, '02', 'COJUTEPEQUE', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (23, '02', 'EL ROSARIO', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (24, '02', 'GUACOTECTI', '09', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (25, '02', 'GUADALUPE', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (26, '02', 'BERLÍN', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (27, '02', 'CIUDAD BARRIOS', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (28, '02', 'CACAOPERA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (29, '02', 'BOLÍVAR', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (30, '03', 'ATIQUIZAYA', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (31, '03', 'CHALCHUAPA', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (32, '03', 'CALUCO', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (33, '03', 'AZACUALPA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (34, '03', 'COLON', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (35, '03', 'AYUTUXTEPEQUE', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (36, '03', 'EL CARMEN', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (37, '03', 'JERUSALÉN', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (38, '03', 'ILOBASCO', '09', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (39, '03', 'SAN CAY ISTEPEQ', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (40, '03', 'CALIFORNIA', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (41, '03', 'COMACARÁN', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (42, '03', 'CORINTO', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (43, '03', 'CONCEP DE OTE', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (44, '04', 'CONCEPCIÓN DE ATACO', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (45, '04', 'EL CONGO', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (46, '04', 'CUISNAHUAT', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (47, '04', 'CITALÁ', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (48, '04', 'COMASAGUA', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (49, '04', 'CUSCATANCINGO', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (50, '04', 'EL ROSARIO', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (51, '04', 'MERCED LA CEIBA', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (52, '04', 'JUTIAPA', '09', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (53, '04', 'SANTA CLARA', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (54, '04', 'CONCEP BATRES', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (55, '04', 'CHAPELTIQUE', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (56, '04', 'CHILANGA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (57, '04', 'CONCHAGUA', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (58, '05', 'EL REFUGIO', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (59, '05', 'EL PORVENIR', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (60, '05', 'STA I ISHUATAN', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (61, '05', 'COMALAPA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (62, '05', 'CHILTIUPAN', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (63, '05', 'EL PAISNAL', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (64, '05', 'MONTE SAN JUAN', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (65, '05', 'OLOCUILTA', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (66, '05', 'SAN ISIDRO', '09', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (67, '05', 'SANTO DOMINGO', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (68, '05', 'EL TRIUNFO', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (69, '05', 'CHINAMECA', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (70, '05', 'DELIC DE CONCEP', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (71, '05', 'EL CARMEN', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (72, '06', 'GUAYMANGO', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (73, '06', 'MASAHUAT', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (74, '06', 'IZALCO', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (75, '06', 'CONCEPCIÓN QUEZALTEPEQUE', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (76, '06', 'HUIZÚCAR', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (77, '06', 'GUAZAPA', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (78, '06', 'ORAT CONCEPCIÓN', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (79, '06', 'PARAÍSO OSORIO', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (80, '06', 'SENSUNTEPEQUE', '09', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (81, '06', 'SN EST CATARINA', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (82, '06', 'EREGUAYQUÍN', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (83, '06', 'CHIRILAGUA', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (84, '06', 'EL DIVISADERO', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (85, '06', 'EL SAUCE', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (86, '07', 'JUJUTLA', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (87, '07', 'METAPÁN', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (88, '07', 'JUAYÚA', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (89, '07', 'CHALATENANGO', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (90, '07', 'JAYAQUE', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (91, '07', 'ILOPANGO', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (92, '07', 'SAN B PERULAPIA', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (93, '07', 'SN ANT MASAHUAT', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (94, '07', 'TEJUTEPEQUE', '09', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (95, '07', 'SAN ILDEFONSO', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (96, '07', 'ESTANZUELAS', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (97, '07', 'EL TRANSITO', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (98, '07', 'EL ROSARIO', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (99, '07', 'INTIPUCÁ', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (100, '08', 'SAN FRANCISCO MENÉNDEZ', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (101, '08', 'SAN ANTONIO PAJONAL', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (102, '08', 'NAHUIZALCO', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (103, '08', 'DULCE NOM MARÍA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (104, '08', 'JICALAPA', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (105, '08', 'MEJICANOS', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (106, '08', 'SAN CRISTÓBAL', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (107, '08', 'SAN EMIGDIO', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (108, '08', 'VICTORIA', '09', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (109, '08', 'SAN LORENZO', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (110, '08', 'JIQUILISCO', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (111, '08', 'LOLOTIQUE', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (112, '08', 'GUALOCOCTI', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (113, '08', 'LA UNIÓN', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (114, '09', 'SAN LORENZO', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (115, '09', 'SAN SEBASTIÁN SALITRILLO', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (116, '09', 'NAHULINGO', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (117, '09', 'EL CARRIZAL', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (118, '09', 'LA LIBERTAD', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (119, '09', 'NEJAPA', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (120, '09', 'SAN J GUAYABAL', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (121, '09', 'SN FCO CHINAMEC', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (122, '09', 'DOLORES', '09', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (123, '09', 'SAN SEBASTIÁN', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (124, '09', 'JUCUAPA', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (125, '09', 'MONCAGUA', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (126, '09', 'GUATAJIAGUA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (127, '09', 'LISLIQUE', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (128, '10', 'SAN PEDRO PUXTLA', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (129, '10', 'SANTA ANA', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (130, '10', 'SALCOATITÁN', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (131, '10', 'EL PARAÍSO', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (132, '10', 'NUEVO CUSCATLÁN', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (133, '10', 'PANCHIMALCO', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (134, '10', 'SAN P PERULAPÁN', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (135, '10', 'SAN J NONUALCO', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (136, '10', 'SAN VICENTE', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (137, '10', 'JUCUARÁN', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (138, '10', 'NUEVA GUADALUPE', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (139, '10', 'JOATECA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (140, '10', 'MEANG DEL GOLFO', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (141, '11', 'TACUBA', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (142, '11', 'STA ROSA GUACHI', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (143, '11', 'SAN ANTONIO DEL MONTE', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (144, '11', 'LA LAGUNA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (145, '11', 'SANTA TECLA', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (146, '11', 'ROSARIO DE MORA', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (147, '11', 'SAN RAF CEDROS', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (148, '11', 'SAN JUAN TALPA', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (149, '11', 'TECOLUCA', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (150, '11', 'MERCEDES UMAÑA', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (151, '11', 'NVO EDÉN S JUAN', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (152, '11', 'JOCOAITIQUE', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (153, '11', 'NUEVA ESPARTA', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (154, '12', 'TURÍN', '01', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (155, '12', 'STGO D LA FRONT', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (156, '12', 'SAN JULIÁN', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (157, '12', 'LA PALMA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (158, '12', 'QUEZALTEPEQUE', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (159, '12', 'SAN MARCOS', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (160, '12', 'SAN RAMON', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (161, '12', 'SAN JUAN TEPEZONTES', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (162, '12', 'TEPETITÁN', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (163, '12', 'NUEVA GRANADA', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (164, '12', 'QUELEPA', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (165, '12', 'JOCORO', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (166, '12', 'PASAQUINA', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (167, '13', 'TEXISTEPEQUE', '02', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (168, '13', 'STA C MASAHUAT', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (169, '13', 'LA REINA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (170, '13', 'SACACOYO', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (171, '13', 'SAN MARTIN', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (172, '13', 'STA C ANALQUITO', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (173, '13', 'SAN LUIS TALPA', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (174, '13', 'VERAPAZ', '10', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (175, '13', 'OZATLÁN', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (176, '13', 'SAN ANT D MOSCO', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (177, '13', 'LOLOTIQUILLO', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (178, '13', 'POLORÓS', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (179, '14', 'SANTO DOMINGO GUZMÁN', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (180, '14', 'LAS VUELTAS', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (181, '14', 'SN J VILLANUEVA', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (182, '14', 'SAN SALVADOR', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (183, '14', 'STA C MICHAPA', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (184, '14', 'SAN MIGUEL TEPEZONTES', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (185, '14', 'PTO EL TRIUNFO', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (186, '14', 'SAN GERARDO', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (187, '14', 'MEANGUERA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (188, '14', 'SAN ALEJO', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (189, '15', 'SONSONATE', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (190, '15', 'NOMBRE DE JESUS', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (191, '15', 'SAN JUAN OPICO', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (192, '15', 'STG TEXACUANGOS', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (193, '15', 'SUCHITOTO', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (194, '15', 'SAN PEDRO MASAHUAT', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (195, '15', 'SAN AGUSTÍN', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (196, '15', 'SAN JORGE', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (197, '15', 'OSICALA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (198, '15', 'SAN JOSE', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (199, '16', 'SONZACATE', '03', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (200, '16', 'NVA CONCEPCIÓN', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (201, '16', 'SAN MATÍAS', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (202, '16', 'SANTO TOMAS', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (203, '16', 'TENANCINGO', '07', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (204, '16', 'SAN PEDRO NONUALCO', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (205, '16', 'SN BUENAVENTURA', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (206, '16', 'SAN LUIS REINA', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (207, '16', 'PERQUÍN', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (208, '16', 'SANTA ROSA LIMA', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (209, '17', 'NUEVA TRINIDAD', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (210, '17', 'SAN P TACACHICO', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (211, '17', 'SOYAPANGO', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (212, '17', 'SAN R OBRAJUELO', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (213, '17', 'SAN DIONISIO', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (214, '17', 'SAN MIGUEL', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (215, '17', 'SAN CARLOS', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (216, '17', 'YAYANTIQUE', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (217, '18', 'OJOS DE AGUA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (218, '18', 'TAMANIQUE', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (219, '18', 'TONACATEPEQUE', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (220, '18', 'STA MA OSTUMA', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (221, '18', 'SANTA ELENA', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (222, '18', 'SAN RAF ORIENTE', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (223, '18', '|SAN FERNANDO', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (224, '18', 'YUCUAIQUÍN', '14', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (225, '19', 'POTONICO', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (226, '19', 'TALNIQUE', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (227, '19', 'CIUDAD DELGADO', '06', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (228, '19', 'STGO NONUALCO', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (229, '19', 'SAN FCO JAVIER', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (230, '19', 'SESORI', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (231, '19', 'SAN FCO GOTERA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (232, '20', 'SAN ANT LA CRUZ', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (233, '20', 'TEOTEPEQUE', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (234, '20', 'TAPALHUACA', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (235, '20', 'SANTA MARÍA', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (236, '20', 'ULUAZAPA', '12', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (237, '20', 'SAN ISIDRO', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (238, '21', 'SAN ANT RANCHOS', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (239, '21', 'TEPECOYO', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (240, '21', 'ZACATECOLUCA', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (241, '21', 'STGO DE MARÍA', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (242, '21', 'SAN SIMÓN', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (243, '22', 'SAN FERNANDO', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (244, '22', 'ZARAGOZA', '05', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (245, '22', 'SN LUIS LA HERR', '08', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (246, '22', 'TECAPÁN', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (247, '22', 'SENSEMBRA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (248, '23', 'SAN FRANCISCO LEMPA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (249, '23', 'USULUTÁN', '11', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (250, '23', 'SOCIEDAD', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (251, '24', 'SAN FRANCISCO MORAZÁN', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (252, '24', 'TOROLA', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (253, '25', 'SAN IGNACIO', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (254, '25', 'YAMABAL', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (255, '26', 'SAN I LABRADOR', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (256, '26', 'YOLOAIQUÍN', '13', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (257, '27', 'SAN J CANCASQUE', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (258, '28', 'SAN JOSE FLORES', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (259, '29', 'SAN LUIS CARMEN', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (260, '30', 'SN MIG MERCEDES', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (261, '31', 'SAN RAFAEL', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (262, '32', 'SANTA RITA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (263, '33', 'TEJUTLA', '04', 'Inactive', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (264, '13', 'AHUACHAPAN NORTE', '01', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (265, '14', 'AHUACHAPAN CENTRO', '01', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (266, '15', 'AHUACHAPAN SUR', '01', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (267, '14', 'SANTA ANA NORTE', '02', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (268, '15', 'SANTA ANA CENTRO', '02', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (269, '16', 'SANTA ANA ESTE', '02', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (270, '17', 'SANTA ANA OESTE', '02', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (271, '17', 'SONSONATE NORTE', '03', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (272, '18', 'SONSONATE CENTRO', '03', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (273, '19', 'SONSONATE ESTE', '03', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (274, '20', 'SONSONATE OESTE', '03', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (275, '34', 'CHALATENANGO NORTE', '04', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (276, '35', 'CHALATENANGO CENTRO', '04', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (277, '36', 'CHALATENANGO SUR', '04', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (278, '23', 'LA LIBERTAD NORTE', '05', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (279, '24', 'LA LIBERTAD CENTRO', '05', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (280, '25', 'LA LIBERTAD OESTE', '05', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (281, '26', 'LA LIBERTAD ESTE', '05', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (282, '27', 'LA LIBERTAD COSTA', '05', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (283, '28', 'LA LIBERTAD SUR', '05', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (284, '20', 'SAN SALVADOR NORTE', '06', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (285, '21', 'SAN SALVADOR OESTE', '06', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (286, '22', 'SAN SALVADOR ESTE', '06', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (287, '23', 'SAN SALVADOR CENTRO', '06', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (288, '24', 'SAN SALVADOR SUR', '06', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (289, '17', 'CUSCATLAN NORTE', '07', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (290, '18', 'CUSCATLAN SUR', '07', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (291, '23', 'LA PAZ OESTE', '08', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (292, '24', 'LA PAZ CENTRO', '08', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (293, '25', 'LA PAZ ESTE', '08', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (294, '10', 'CABANAS OESTE', '09', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (295, '11', 'CABANAS ESTE', '09', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (296, '14', 'SAN VICENTE NORTE', '10', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (297, '15', 'SAN VICENTE SUR', '10', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (298, '24', 'USULUTAN NORTE', '11', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (299, '25', 'USULUTAN ESTE', '11', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (300, '26', 'USULUTAN OESTE', '11', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (301, '21', 'SAN MIGUEL NORTE', '12', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (302, '22', 'SAN MIGUEL CENTRO', '12', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (303, '23', 'SAN MIGUEL OESTE', '12', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (304, '27', 'MORAZAN NORTE', '13', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (305, '28', 'MORAZAN SUR', '13', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (306, '19', 'LA UNION NORTE', '14', 'Active', null);
INSERT INTO contabilidad.municipios (munidepa_id, muni_id, muni_nombre, depa_id, muni_status, deleted_at) VALUES (307, '20', 'LA UNION SUR', '14', 'Active', null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (1, 1, 'Otro país', 'Inactive', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (2, 265, 'AHUACHAPÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (3, 270, 'CANDELARIA DE LA FRONTERA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (4, 274, 'ACAJUTLA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (5, 276, 'AGUA CALIENTE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (6, 281, 'ANTIGUO CUSCATLÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (7, 284, 'AGUILARES', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (8, 290, 'CANDELARIA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (9, 291, 'CUYULTITÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (10, 294, 'CINQUERA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (11, 296, 'APASTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (12, 298, 'ALEGRÍA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (13, 301, 'CAROLINA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (14, 304, 'ARAMBALA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (15, 306, 'ANAMOROS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (16, 265, 'APANECA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (17, 269, 'COATEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (18, 273, 'ARMENIA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (19, 277, 'ARCATAO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (20, 279, 'CIUDAD ARCE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (21, 285, 'APOPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (22, 290, 'COJUTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (23, 290, 'EL ROSARIO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (24, 295, 'GUACOTECTI', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (25, 297, 'GUADALUPE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (26, 298, 'BERLÍN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (27, 301, 'CIUDAD BARRIOS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (28, 304, 'CACAOPERA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (29, 306, 'BOLÍVAR', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (30, 264, 'ATIQUIZAYA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (31, 270, 'CHALCHUAPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (32, 273, 'CALUCO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (33, 277, 'AZACUALPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (34, 280, 'COLON', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (35, 287, 'AYUTUXTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (36, 307, 'EL CARMEN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (37, 292, 'JERUSALÉN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (38, 294, 'ILOBASCO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (39, 297, 'SAN CAYETANO ISTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (40, 299, 'CALIFORNIA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (41, 302, 'COMACARÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (42, 304, 'CORINTO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (43, 306, 'CONCEPCIÓN DE ORIENTE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (44, 265, 'CONCEPCIÓN DE ATACO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (45, 269, 'EL CONGO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (46, 273, 'CUISNAHUAT', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (47, 275, 'CITALÁ', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (48, 283, 'COMASAGUA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (49, 287, 'CUSCATANCINGO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (50, 292, 'EL ROSARIO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (51, 292, 'MERCEDES LA CEIBA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (52, 294, 'JUTIAPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (53, 296, 'SANTA CLARA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (54, 299, 'CONCEPCIÓN BATRES', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (55, 301, 'CHAPELTIQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (56, 305, 'CHILANGA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (57, 307, 'CONCHAGUA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (58, 264, 'EL REFUGIO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (59, 270, 'EL PORVENIR', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (60, 273, 'SANTA ISABEL ISHUATÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (61, 277, 'COMALAPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (62, 282, 'CHILTIUPAN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (63, 284, 'EL PAISNAL', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (64, 290, 'MONTE SAN JUAN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (65, 291, 'OLOCUILTA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (66, 304, 'SAN ISIDRO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (67, 296, 'SANTO DOMINGO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (68, 298, 'EL TRIUNFO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (69, 303, 'CHINAMECA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (70, 305, 'DELICIAS DE CONCEPCIÓN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (71, 307, 'EL CARMEN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (72, 266, 'GUAYMANGO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (73, 267, 'MASAHUAT', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (74, 273, 'IZALCO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (75, 277, 'CONCEPCIÓN QUEZALTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (76, 281, 'HUIZÚCAR', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (77, 284, 'GUAZAPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (78, 289, 'ORATORIO DE CONCEPCIÓN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (79, 292, 'PARAÍSO DE OSORIO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (80, 295, 'SENSUNTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (81, 296, 'SAN ESTEBAN CATARINA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (82, 299, 'EREGUAYQUÍN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (83, 302, 'CHIRILAGUA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (84, 305, 'EL DIVISADERO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (85, 306, 'EL SAUCE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (86, 266, 'JUJUTLA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (87, 267, 'METAPÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (88, 271, 'JUAYÚA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (89, 277, 'CHALATENANGO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (90, 280, 'JAYAQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (91, 286, 'ILOPANGO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (92, 289, 'SAN BARTOLOMÉ PERULAPÍA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (93, 292, 'SAN ANTONIO MASAHUAT', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (94, 294, 'TEJUTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (95, 296, 'SAN ILDEFONSO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (96, 298, 'ESTANZUELAS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (97, 303, 'EL TRANSITO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (98, 304, 'EL ROSARIO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (99, 307, 'INTIPUCÁ', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (100, 266, 'SAN FRANCISCO MENÉNDEZ', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (101, 270, 'SAN ANTONIO PAJONAL', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (102, 271, 'NAHUIZALCO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (103, 276, 'DULCE NOMBRE DE MARÍA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (104, 282, 'JICALAPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (105, 287, 'MEJICANOS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (106, 290, 'SAN CRISTÓBAL', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (107, 292, 'SAN EMIGDIO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (108, 295, 'VICTORIA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (109, 296, 'SAN LORENZO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (110, 300, 'JIQUILISCO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (111, 303, 'LOLOTIQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (112, 305, 'GUALOCOCTI', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (113, 307, 'LA UNIÓN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (114, 296, 'SAN LORENZO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (115, 270, 'SAN SEBASTIÁN SALITRILLO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (116, 272, 'NAHULINGO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (117, 277, 'EL CARRIZAL', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (118, 282, 'LA LIBERTAD', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (119, 285, 'NEJAPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (120, 289, 'SAN JOSÉ GUAYABAL', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (121, 291, 'SAN FRANCISCO CHINAMECA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (122, 295, 'DOLORES', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (123, 296, 'SAN SEBASTIÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (124, 298, 'JUCUAPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (125, 302, 'MONCAGUA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (126, 305, 'GUATAJIAGUA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (127, 306, 'LISLIQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (128, 266, 'SAN PEDRO PUXTLA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (129, 268, 'SANTA ANA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (130, 271, 'SALCOATITÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (131, 276, 'EL PARAÍSO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (132, 281, 'NUEVO CUSCATLÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (133, 288, 'PANCHIMALCO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (134, 289, 'SAN PEDRO PERULAPÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (135, 293, 'SAN JUAN NONUALCO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (136, 297, 'SAN VICENTE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (137, 299, 'JUCUARÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (138, 303, 'NUEVA GUADALUPE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (139, 304, 'JOATECA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (140, 307, 'MEANGUERA DEL GOLFO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (141, 265, 'TACUBA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (142, 267, 'SANTA ROSA GUACHIPILÍN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (143, 272, 'SAN ANTONIO DEL MONTE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (144, 277, 'LA LAGUNA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (145, 283, 'SANTA TECLA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (146, 288, 'ROSARIO DE MORA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (147, 290, 'SAN RAFAEL CEDROS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (148, 291, 'SAN JUAN TALPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (149, 297, 'TECOLUCA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (150, 298, 'MERCEDES UMAÑA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (151, 301, 'NUEVO EDÉN DE SAN JUAN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (152, 304, 'JOCOAITIQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (153, 306, 'NUEVA ESPARTA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (154, 264, 'TURÍN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (155, 270, 'SANTIAGO DE LA FRONTERA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (156, 273, 'SAN JULIÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (157, 275, 'LA PALMA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (158, 278, 'QUEZALTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (159, 288, 'SAN MARCOS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (160, 290, 'SAN RAMON', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (161, 292, 'SAN JUAN TEPEZONTES', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (162, 297, 'TEPETITÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (163, 298, 'NUEVA GRANADA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (164, 302, 'QUELEPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (165, 305, 'JOCORO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (166, 306, 'PASAQUINA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (167, 267, 'TEXISTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (168, 271, 'SANTA CATARINA MASAHUAT', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (169, 276, 'LA REINA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (170, 280, 'SACACOYO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (171, 286, 'SAN MARTIN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (172, 290, 'SANTA CRUZ ANALQUITO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (173, 291, 'SAN LUIS TALPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (174, 297, 'VERAPAZ', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (175, 299, 'OZATLÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (176, 301, 'SAN ANTONIO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (177, 305, 'LOLOTIQUILLO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (178, 306, 'POLORÓS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (179, 272, 'SANTO DOMINGO DE GUZMÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (180, 277, 'LAS VUELTAS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (181, 281, 'SAN JOSÉ VILLANUEVA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (182, 287, 'SAN SALVADOR', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (183, 290, 'SANTA CRUZ MICHAPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (184, 292, 'SAN MIGUEL TEPEZONTES', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (185, 300, 'PUERTO EL TRIUNFO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (186, 301, 'SAN GERARDO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (187, 304, 'MEANGUERA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (188, 307, 'SAN ALEJO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (189, 272, 'SONSONATE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (190, 277, 'NOMBRE DE JESUS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (191, 279, 'SAN JUAN OPICO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (192, 288, 'SANTIAGO TEXACUANGOS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (193, 289, 'SUCHITOTO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (194, 291, 'SAN PEDRO MASAHUAT', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (195, 300, 'SAN AGUSTÍN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (196, 303, 'SAN JORGE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (197, 305, 'OSICALA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (198, 306, 'SAN JOSE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (199, 272, 'SONZACATE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (200, 276, 'NUEVA CONCEPCIÓN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (201, 278, 'SAN MATÍAS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (202, 288, 'SANTO TOMAS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (203, 290, 'TENANCINGO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (204, 292, 'SAN PEDRO NONUALCO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (205, 298, 'SAN BUENAVENTURA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (206, 301, 'SAN LUIS DE LA REINA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (207, 304, 'PERQUÍN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (208, 306, 'SANTA ROSA DE LIMA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (209, 277, 'NUEVA TRINIDAD', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (210, 278, 'SAN PABLO TACACHICO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (211, 286, 'SOYAPANGO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (212, 293, 'SAN RAFAEL OBRAJUELO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (213, 299, 'SAN DIONISIO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (214, 302, 'SAN MIGUEL', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (215, 305, 'SAN CARLOS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (216, 307, 'YAYANTIQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (217, 277, 'OJOS DE AGUA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (218, 282, 'TAMANIQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (219, 286, 'TONACATEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (220, 292, 'SANTA MARÍA OSTUMA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (221, 299, 'SANTA ELENA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (222, 303, 'SAN RAFAEL ORIENTE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (223, 276, 'SAN FERNANDO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (224, 307, 'YUCUAIQUÍN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (225, 277, 'POTONICO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (226, 280, 'TALNIQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (227, 287, 'CIUDAD DELGADO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (228, 292, 'SANTIAGO NONUALCO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (229, 300, 'SAN FRANCISCO JAVIER', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (230, 301, 'SESORI', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (231, 305, 'SAN FRANCISCO GOTERA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (232, 277, 'SAN ANTONIO DE LA CRUZ', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (233, 282, 'TEOTEPEQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (234, 291, 'TAPALHUACA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (235, 299, 'SANTA MARÍA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (236, 302, 'ULUAZAPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (237, 304, 'SAN ISIDRO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (238, 277, 'SAN ANTONIO LOS RANCHOS', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (239, 280, 'TEPECOYO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (240, 293, 'ZACATECOLUCA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (241, 298, 'SANTIAGO DE MARÍA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (242, 305, 'SAN SIMÓN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (243, 304, 'SAN FERNANDO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (244, 281, 'ZARAGOZA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (245, 292, 'SAN LUIS LA HERRADURA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (246, 299, 'TECAPÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (247, 305, 'SENSEMBRA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (248, 277, 'SAN FRANCISCO LEMPA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (249, 299, 'USULUTÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (250, 305, 'SOCIEDAD', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (251, 276, 'SAN FRANCISCO MORAZÁN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (252, 304, 'TOROLA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (253, 275, 'SAN IGNACIO', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (254, 305, 'YAMABAL', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (255, 277, 'SAN ISIDRO LABRADOR', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (256, 305, 'YOLOAIQUÍN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (257, 277, 'CANCASQUE', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (258, 277, 'LAS FLORES', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (259, 277, 'SAN LUIS DEL CARMEN', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (260, 277, 'SAN MIGUEL DE MERCEDES', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (261, 276, 'SAN RAFAEL', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (262, 276, 'SANTA RITA', 'Active', null, null, null);
INSERT INTO contabilidad.districts (dist_id, munidepa_id, dist_name, dist_status, deleted_at, created_at, updated_at) VALUES (263, 276, 'TEJUTLA', 'Active', null, null, null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9320', 'ANGUILA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9539', 'ISLAS TURCAS Y CAICOS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9565', 'LITUANIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9905', 'DAKOTA DEL SUR (USA)', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9999', 'No definido en migración', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9303', 'AFGANISTÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9306', 'ALBANIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9309', 'ALEMANIA OCCID', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9310', 'ALEMANIA ORIENT', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9315', 'ALTO VOLTA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9317', 'ANDORRA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9318', 'ANGOLA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9319', 'ANTIG Y BARBUDA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9324', 'ARABIA SAUDITA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9327', 'ARGELIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9330', 'ARGENTINA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9333', 'AUSTRALIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9336', 'AUSTRIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9339', 'BANGLADESH', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9342', 'BAHRÉIN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9345', 'BARBADOS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9348', 'BÉLGICA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9349', 'BELICE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9350', 'BENÍN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9354', 'BIRMANIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9357', 'BOLIVIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9360', 'BOTSWANA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9363', 'BRASIL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9366', 'BRUNÉI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9372', 'BURUNDI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9374', 'BOPHUTHATSWANA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9375', 'BUTÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9377', 'CABO VERDE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9378', 'CAMBOYA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9381', 'CAMERÚN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9384', 'CANADÁ', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9387', 'CEILÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9390', 'CTRO AFRIC REP', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9393', 'COLOMBIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9394', 'COMORAS-ISLAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9396', 'CONGO REP DEL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9399', 'CONGO REP DEMOC', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9402', 'COREA NORTE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9405', 'COREA SUR', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9408', 'COSTA DE MARFIL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9411', 'COSTA RICA', 'CR');
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9414', 'CUBA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9417', 'CHAD', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9420', 'CHECOSLOVAQUIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9423', 'CHILE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9426', 'CHINA REP POPUL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9432', 'CHIPRE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9435', 'DAHOMEY', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9438', 'DINAMARCA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9440', 'DOMINICA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9441', 'DOMINICANA REP', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9444', 'ECUADOR', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9446', 'EMIRAT ARAB UNI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9447', 'ESPAÑA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9450', 'EE UU', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9453', 'ETIOPIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9456', 'FIJI-ISLAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9459', 'FILIPINAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9462', 'FINLANDIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9465', 'FRANCIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9468', 'GABÓN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9471', 'GAMBIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9474', 'GHANA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9477', 'GIBRALTAR', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9480', 'GRECIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9481', 'GRENADA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9483', 'GUATEMALA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9486', 'GUINEA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9487', 'GUYANA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9495', 'HAITÍ', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9498', 'HOLANDA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9501', 'HONDURAS', 'HN');
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9504', 'HONG KONG', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9507', 'HUNGRÍA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9513', 'INDONESIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9516', 'IRAK', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9519', 'IRÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9522', 'IRLANDA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9525', 'ISLANDIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9526', 'ISLAS SALOMÓN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9528', 'ISRAEL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9531', 'ITALIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9534', 'JAMAICA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9537', 'JAPÓN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9540', 'JORDANIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9543', 'KENIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9544', 'KIRIBATI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9546', 'KUWAIT', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9549', 'LAOS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9552', 'LESOTHO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9555', 'LÍBANO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9558', 'LIBERIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9561', 'LIBIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9564', 'LIECHTENSTEIN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9567', 'LUXEMBURGO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9570', 'MADAGASCAR', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9573', 'MALASIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9576', 'MALAWI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9577', 'MALDIVAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9582', 'MALTA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9585', 'MARRUECOS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9591', 'MASCATE Y OMÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9594', 'MAURICIO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9597', 'MAURITANIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9600', 'MÉXICO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9601', 'MICRONESIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9603', 'MÓNACO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9606', 'MONGOLIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9609', 'MOZAMBIQUE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9611', 'NAURU', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9612', 'NEPAL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9615', 'NICARAGUA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9618', 'NÍGER', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9621', 'NIGERIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9624', 'NORUEGA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9627', 'NVA CALEDONIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9633', 'NVA ZELANDIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9636', 'NUEVAS HEBRIDAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9638', 'PAPUA NV GUINEA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9639', 'PAKISTÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9642', 'PANAMÁ', 'PA');
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9645', 'PARAGUAY', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9648', 'PERÚ', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9651', 'POLONIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9660', 'QATAR EL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9663', 'REINO UNIDO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9666', 'EGIPTO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9669', 'RODESIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9672', 'RUANDA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9675', 'RUMANIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9677', 'SAN MARINO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9678', 'SAMOA OCCID', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9679', 'SAINT KITTS AND NEVIS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9680', 'SANTA LUCIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9681', 'SENEGAL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9682', 'SAOTOME Y PRINC', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9683', 'SN VIC Y GRENAD', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9684', 'SIERRA LEONA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9687', 'SINGAPUR', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9690', 'SIRIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9691', 'SEYCHELLES', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9693', 'SOMALIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9696', 'SUDÁFRICA REP', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9699', 'SUDAN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9702', 'SUECIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9705', 'SUIZA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9706', 'SURINAM', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9707', 'SRI LANKA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9708', 'SUECILANDIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9714', 'TANZANIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9717', 'TOGO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9720', 'TRINIDAD TOBAGO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9722', 'TONGA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9723', 'TÚNEZ', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9725', 'TRANSKEI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9726', 'TURQUÍA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9727', 'TUVALU', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9729', 'UGANDA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9732', 'U R S S', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9735', 'URUGUAY', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9738', 'VATICANO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9739', 'VANUATU', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9740', 'VENDA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9741', 'VENEZUELA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9744', 'VIETNAM NORTE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9747', 'VIETNAM SUR', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9750', 'YEMEN SUR REP', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9756', 'YUGOSLAVIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9758', 'ZAIRE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9759', 'ZAMBIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9760', 'ZIMBABWE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9850', 'PUERTO RICO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9862', 'BAHAMAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9863', 'BERMUDAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9865', 'MARTINICA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9886', 'NUEVA GUINEA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9898', 'ANT HOLANDESAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9899', 'TAIWÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9897', 'ISLAS VÍRGENES BRITÁNICAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9887', 'ISLAS GRAN CAIMÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9571', 'MACEDONIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9300', 'EL SALVADOR', 'SV');
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9369', 'BULGARIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9439', 'DJIBOUTI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9510', 'INDIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9579', 'MALI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9654', 'PORTUGAL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9711', 'TAILANDIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9736', 'UCRANIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9737', 'UZBEKISTÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9640', 'PALESTINA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9641', 'CROACIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9673', 'REPUBLICA DE ARMENIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9472', 'GEORGIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9311', 'ALEMANIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9733', 'RUSIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9541', 'KASAKISTAN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9746', 'VIETNAM', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9551', 'LETONIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9451', 'ESLOVENIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9338', 'AZERBAIYÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9353', 'BIELORRUSIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9482', 'GROENLANDIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9494', 'GUINEA-BISSAU', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9524', 'ISLA DE COCOS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9304', 'ALAND', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9332', 'ARUBA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9454', 'ERITREA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9457', 'ESTONIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9489', 'GUADALUPE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9491', 'GUAYANA FRANCESA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9492', 'GUERNSEY', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9523', 'ISLA DE NAVIDAD', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9530', 'ISLAS AZORES', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9532', 'ISLA QESHM', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9535', 'ISLAS MARIANAS DEL NORTE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9542', 'ISLAS ULTRAMARINAS DE EE UU', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9547', 'JERSEY', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9548', 'KIRGUISTÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9574', 'MALI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9598', 'MAYOTTE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9602', 'MOLDAVIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9607', 'MONTENEGRO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9608', 'MONSERRAT', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9623', 'NORFOLK', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9652', 'POLINESIA FRANCESA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9692', 'SVALBARD Y JAN MAYEN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9709', 'TAYIKISTÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9712', 'TERRITORIO BRITÁNICO DEL OCÉANO INDICO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9716', 'TIMOR ORIENTAL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9718', 'TOKELAU', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9719', 'TURKMENISTÁN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9751', 'YIBUTI', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9452', 'WALLIS Y FUTUNA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9901', 'NEVADA (USA)', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9902', 'WYOMING (USA)', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9903', 'CAMPIONE D\'ITALIA, ITALIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9664', 'REPUBLICA CHECA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9415', 'CURAZAO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9904', 'FLORIDA (USA)', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9514', 'INGLATERRA Y GALES', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9906', 'TEXAS (USA)', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9359', 'BOSNIA Y HERZEGOVINA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9493', 'GUINEA ECUATORIAL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9521', 'ISLA DE MAN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9533', 'ISLAS MALVINAS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9538', 'ISLAS PITCAIM', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9689', 'SERBIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9713', 'TERRITORIOS AUSTRALES FRANCESES', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9449', 'ESLOVAQUIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9888', 'SAN MAARTEN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9490', 'GUAM', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9527', 'ISLAS COOK', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9529', 'ISLAS FEROE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9536', 'ISLAS MARSHALL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9545', 'ISLAS VÍRGENES ESTADOUNIDENSES', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9568', 'MACAO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9610', 'NAMIBIA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9622', 'NIUE', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9643', 'PALAOS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9667', 'REUNIÓN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9676', 'SAHARA OCCIDENTAL', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9685', 'SAMOA AMERICANA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9686', 'SAN PEDRO Y MIQUELÓN', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9688', 'SANTA ELENA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9715', 'TERRITORIOS PALESTINOS', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9900', 'DELAWARE (USA)', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9371', 'BURKINA FASO', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9376', 'CABINDA', null);
INSERT INTO contabilidad.paises (pais_id, pais_nombre, pais_code) VALUES ('9907', 'WASHINGTON (USA) ', null);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01111', 'CULTIVO DE CEREALES EXCEPTO ARROZ Y PARA FORRAJES', 'no', 3);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01112', 'CULTIVO DE LEGUMBRES', 'no', 4);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01113', 'CULTIVO DE SEMILLAS OLEAGINOSAS', 'no', 5);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01114', 'CULTIVO DE PLANTAS PARA LA PREPARACIÓN DE SEMILLAS', 'no', 6);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01119', 'CULTIVO DE OTROS CEREALES EXCEPTO ARROZ Y FORRAJEROS N.C.P. ', 'no', 7);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01120', 'CULTIVO DE ARROZ', 'no', 8);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01131', 'CULTIVO DE RAÍCES Y TUBÉRCULOS', 'no', 9);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01132', 'CULTIVO DE BROTES, BULBOS, VEGETALES TUBÉRCULOS Y CULTIVOS SIMILARES', 'no', 10);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01133', 'CULTIVO HORTÍCOLA DE FRUTO', 'no', 11);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01134', 'CULTIVO DE HORTALIZAS DE HOJA Y OTRAS HORTALIZAS NCP', 'no', 12);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01140', 'CULTIVO DE CAÑA DE AZÚCAR', 'no', 13);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01150', 'CULTIVO DE TABACO', 'no', 14);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01161', 'CULTIVO DE ALGODÓN', 'no', 15);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01162', 'CULTIVO DE FIBRAS VEGETALES EXCEPTO ALGODÓN', 'no', 16);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01191', 'CULTIVO DE PLANTAS NO PERENNES PARA LA PRODUCCIÓN DE SEMILLAS Y FLORES', 'no', 17);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01192', 'CULTIVO DE CEREALES Y PASTOS PARA LA ALIMENTACIÓN ANIMAL', 'no', 18);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01199', 'PRODUCCIÓN DE CULTIVOS NO ESTACIONALES NCP', 'no', 19);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01220', 'CULTIVO DE FRUTAS TROPICALES', 'no', 20);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01230', 'CULTIVO DE CÍTRICOS', 'no', 21);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01240', 'CULTIVO DE FRUTAS DE PEPITA Y HUESO', 'no', 22);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01251', 'CULTIVO DE FRUTAS NCP', 'no', 23);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01252', 'CULTIVO DE OTROS FRUTOS Y NUECES DE ÁRBOLES Y ARBUSTOS', 'no', 24);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01260', 'CULTIVO DE FRUTOS OLEAGINOSOS', 'no', 25);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01271', 'CULTIVO DE CAFÉ', 'no', 26);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01272', 'CULTIVO DE PLANTAS PARA LA ELABORACIÓN DE BEBIDAS EXCEPTO CAFÉ', 'no', 27);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01281', 'CULTIVO DE ESPECIAS Y AROMÁTICAS', 'no', 28);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01282', 'CULTIVO DE PLANTAS PARA LA OBTENCIÓN DE PRODUCTOS MEDICINALES Y FARMACÉUTICOS', 'no', 29);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01291', 'CULTIVO DE ÁRBOLES DE HULE (CAUCHO) PARA LA OBTENCIÓN DE LÁTEX', 'no', 30);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01292', 'CULTIVO DE PLANTAS PARA LA OBTENCIÓN DE PRODUCTOS QUÍMICOS Y COLORANTES', 'no', 31);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01299', 'PRODUCCIÓN DE CULTIVOS PERENNES NCP', 'no', 32);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01300', 'PROPAGACIÓN DE PLANTAS', 'no', 33);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01301', 'CULTIVO DE PLANTAS Y FLORES ORNAMENTALES', 'no', 34);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01410', 'CRÍA Y ENGORDE DE GANADO BOVINO', 'no', 35);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01420', 'CRÍA DE CABALLOS Y OTROS EQUINOS', 'no', 36);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01440', 'CRÍA DE OVEJAS Y CABRAS', 'no', 37);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01450', 'CRÍA DE CERDOS', 'no', 38);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01460', 'CRÍA DE AVES DE CORRAL Y PRODUCCIÓN DE HUEVOS', 'no', 39);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01491', 'CRÍA DE ABEJAS APICULTURA PARA LA OBTENCIÓN DE MIEL Y OTROS PRODUCTOS APÍCOLAS', 'no', 40);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01492', 'CRÍA DE CONEJOS', 'no', 41);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01493', 'CRÍA DE IGUANAS Y GARROBOS ', 'no', 42);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01494', 'CRÍA DE MARIPOSAS Y OTROS INSECTOS', 'no', 43);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01499', 'CRÍA Y OBTENCIÓN DE PRODUCTOS ANIMALES N.C.P.', 'no', 44);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01500', 'CULTIVO DE PRODUCTOS AGRÍCOLAS EN COMBINACIÓN CON LA CRÍA DE ANIMALES', 'no', 45);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01611', 'SERVICIOS DE MAQUINARIA AGRÍCOLA', 'no', 46);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01612', 'CONTROL DE PLAGAS', 'no', 47);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01613', 'SERVICIOS DE RIEGO', 'no', 48);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01614', 'SERVICIOS DE CONTRATACIÓN DE MANO DE OBRA PARA LA AGRICULTURA', 'no', 49);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01619', 'SERVICIOS AGRÍCOLAS NCP', 'no', 50);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01621', 'ACTIVIDADES PARA MEJORAR LA REPRODUCCIÓN, EL CRECIMIENTO Y EL RENDIMIENTO DE LOS ANIMALES Y SUS PRODUCTOS', 'no', 51);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01622', 'SERVICIOS DE MANO DE OBRA PECUARIA', 'no', 52);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01629', 'SERVICIOS PECUARIOS NCP', 'no', 53);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01631', 'LABORES POST COSECHA DE PREPARACIÓN DE LOS PRODUCTOS AGRÍCOLAS PARA SU COMERCIALIZACIÓN O PARA LA INDUSTRIA', 'no', 54);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01632', 'SERVICIO DE BENEFICIO DE CAFÉ', 'no', 55);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01633', 'SERVICIO DE BENEFICIADO DE PLANTAS TEXTILES (INCLUYE EL BENEFICIADO CUANDO ESTE ES REALIZADO EN LA MISMA EXPLOTACIÓN AGROPECUARIA)', 'no', 56);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01640', 'TRATAMIENTO DE SEMILLAS PARA LA PROPAGACIÓN', 'no', 57);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('01700', 'CAZA ORDINARIA Y MEDIANTE TRAMPAS, REPOBLACIÓN DE ANIMALES DE CAZA Y SERVICIOS CONEXOS ', 'no', 58);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('02100', 'SILVICULTURA Y OTRAS ACTIVIDADES FORESTALES', 'no', 60);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('02200', 'EXTRACCIÓN DE MADERA', 'no', 61);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('02300', 'RECOLECCIÓN DE PRODUCTOS DIFERENTES A LA MADERA', 'no', 62);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('02400', 'SERVICIOS DE APOYO A LA SILVICULTURA ', 'no', 63);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('03110', 'PESCA MARÍTIMA DE ALTURA Y COSTERA', 'no', 65);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('03120', 'PESCA DE AGUA DULCE', 'no', 66);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('03210', 'ACUICULTURA MARÍTIMA', 'no', 67);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('03220', 'ACUICULTURA DE AGUA DULCE', 'no', 68);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('03300', 'SERVICIOS DE APOYO A LA PESCA Y ACUICULTURA ', 'no', 69);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('05100', 'EXTRACCIÓN DE HULLA', 'no', 72);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('05200', 'EXTRACCIÓN Y AGLOMERACIÓN DE LIGNITO ', 'no', 73);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('06100', 'EXTRACCIÓN DE PETRÓLEO CRUDO', 'no', 75);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('06200', 'EXTRACCIÓN DE GAS NATURAL ', 'no', 76);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('07100', 'EXTRACCIÓN DE MINERALES DE HIERRO', 'no', 78);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('07210', 'EXTRACCIÓN DE MINERALES DE URANIO Y TORIO', 'no', 79);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('07290', 'EXTRACCIÓN DE MINERALES METALÍFEROS NO FERROSOS ', 'no', 80);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('08100', 'EXTRACCIÓN DE PIEDRA, ARENA Y ARCILLA', 'no', 82);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('08910', 'EXTRACCIÓN DE MINERALES PARA LA FABRICACIÓN DE ABONOS Y PRODUCTOS QUÍMICOS', 'no', 83);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('08920', 'EXTRACCIÓN Y AGLOMERACIÓN DE TURBA', 'no', 84);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('08930', 'EXTRACCIÓN DE SAL', 'no', 85);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('08990', 'EXPLOTACIÓN DE OTRAS MINAS Y CANTERAS NCP ', 'no', 86);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('09100', 'ACTIVIDADES DE APOYO A LA EXTRACCIÓN DE PETRÓLEO Y GAS NATURAL', 'no', 88);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('09900', 'ACTIVIDADES DE APOYO A LA EXPLOTACIÓN DE MINAS Y CANTERAS ', 'no', 89);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10001', 'EMPLEADOS', 'no', 872);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10002', 'PENSIONADO', 'no', 873);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10003', 'ESTUDIANTE', 'no', 874);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10004', 'DESEMPLEADO', 'no', 875);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10005', 'OTROS ', 'no', 876);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10006', 'COMERCIANTE', 'no', 877);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10101', 'SERVICIO DE RASTROS Y MATADEROS DE BOVINOS Y PORCINOS', 'no', 92);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10102', 'MATANZA Y PROCESAMIENTO DE BOVINOS Y PORCINOS', 'no', 93);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10103', 'MATANZA Y PROCESAMIENTOS DE AVES DE CORRAL', 'no', 94);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10104', 'ELABORACIÓN Y CONSERVACIÓN DE EMBUTIDOS Y TRIPAS NATURALES', 'no', 95);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10105', 'SERVICIOS DE CONSERVACIÓN Y EMPAQUE DE CARNES', 'no', 96);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10106', 'ELABORACIÓN Y CONSERVACIÓN DE GRASAS Y ACEITES ANIMALES', 'no', 97);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10107', 'SERVICIOS DE MOLIENDA DE CARNE', 'no', 98);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10108', 'ELABORACIÓN DE PRODUCTOS DE CARNE NCP', 'no', 99);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10201', 'PROCESAMIENTO Y CONSERVACIÓN DE PESCADO, CRUSTÁCEOS Y MOLUSCOS', 'no', 100);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10209', 'FABRICACIÓN DE PRODUCTOS DE PESCADO NCP', 'no', 101);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10301', 'ELABORACIÓN DE JUGOS DE FRUTAS Y HORTALIZAS', 'no', 102);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10302', 'ELABORACIÓN Y ENVASE DE JALEAS, MERMELADAS Y FRUTAS DESHIDRATADAS', 'no', 103);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10309', 'ELABORACIÓN DE PRODUCTOS DE FRUTAS Y HORTALIZAS N.C.P.', 'no', 104);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10401', 'FABRICACIÓN DE ACEITES Y GRASAS VEGETALES Y ANIMALES COMESTIBLES', 'no', 105);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10402', 'FABRICACIÓN DE ACEITES Y GRASAS VEGETALES Y ANIMALES NO COMESTIBLES', 'no', 106);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10409', 'SERVICIO DE MAQUILADO DE ACEITES', 'no', 107);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10501', 'FABRICACIÓN DE PRODUCTOS LÁCTEOS EXCEPTO SORBETES Y QUESOS SUSTITUTOS', 'no', 108);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10502', 'FABRICACIÓN DE SORBETES Y HELADOS', 'no', 109);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10503', 'FABRICACIÓN DE QUESOS', 'no', 110);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10611', 'MOLIENDA DE CEREALES', 'no', 111);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10612', 'ELABORACIÓN DE CEREALES PARA EL DESAYUNO Y SIMILARES ', 'no', 112);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10613', 'SERVICIOS DE BENEFICIADO DE PRODUCTOS AGRÍCOLAS NCP (EXCLUYE BENEFICIO DE AZÚCAR RAMA 1072 Y BENEFICIO DE CAFÉ RAMA 0163)', 'no', 113);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10621', 'FABRICACIÓN DE ALMIDÓN', 'no', 114);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10628', 'SERVICIO DE MOLIENDA DE MAÍZ HÚMEDO MOLINO PARA NIXTAMAL', 'no', 115);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10711', 'ELABORACIÓN DE TORTILLAS', 'no', 116);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10712', 'FABRICACIÓN DE PAN, GALLETAS Y BARQUILLOS', 'no', 117);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10713', 'FABRICACIÓN DE REPOSTERÍA', 'no', 118);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10721', 'INGENIOS AZUCAREROS', 'no', 119);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10722', 'MOLIENDA DE CAÑA DE AZÚCAR PARA LA ELABORACIÓN DE DULCES', 'no', 120);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10723', 'ELABORACIÓN DE JARABES DE AZÚCAR Y OTROS SIMILARES', 'no', 121);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10724', 'MAQUILADO DE AZÚCAR DE CAÑA', 'no', 122);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10730', 'FABRICACIÓN DE CACAO, CHOCOLATES Y PRODUCTOS DE CONFITERÍA', 'no', 123);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10740', 'ELABORACIÓN DE MACARRONES, FIDEOS, Y PRODUCTOS FARINÁCEOS SIMILARES', 'no', 124);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10750', 'ELABORACIÓN DE COMIDAS Y PLATOS PREPARADOS PARA LA REVENTA EN LOCALES Y/O PARA EXPORTACIÓN', 'no', 125);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10791', 'ELABORACIÓN DE PRODUCTOS DE CAFÉ', 'no', 126);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10792', 'ELABORACIÓN DE ESPECIES, SAZONADORES Y CONDIMENTOS', 'no', 127);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10793', 'ELABORACIÓN DE SOPAS, CREMAS Y CONSOMÉ', 'no', 128);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10794', 'FABRICACIÓN DE BOCADILLOS TOSTADOS Y/O FRITOS', 'no', 129);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10799', 'ELABORACIÓN DE PRODUCTOS ALIMENTICIOS NCP', 'no', 130);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('10800', 'ELABORACIÓN DE ALIMENTOS PREPARADOS PARA ANIMALES', 'no', 131);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('11012', 'FABRICACIÓN DE AGUARDIENTE Y LICORES', 'no', 133);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('11020', 'ELABORACIÓN DE VINOS', 'no', 134);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('11030', 'FABRICACIÓN DE CERVEZA', 'no', 135);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('11041', 'FABRICACIÓN DE AGUAS GASEOSAS', 'no', 136);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('11042', 'FABRICACIÓN Y ENVASADO DE AGUA', 'no', 137);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('11043', 'ELABORACIÓN DE REFRESCOS', 'no', 138);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('11048', 'MAQUILADO DE AGUAS GASEOSAS', 'no', 139);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('11049', 'ELABORACIÓN DE BEBIDAS NO ALCOHÓLICAS', 'no', 140);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('12000', 'ELABORACIÓN DE PRODUCTOS DE TABACO', 'no', 142);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13111', 'PREPARACIÓN DE FIBRAS TEXTILES', 'no', 144);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13112', 'FABRICACIÓN DE HILADOS', 'no', 145);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13120', 'FABRICACIÓN DE TELAS', 'no', 146);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13130', 'ACABADO DE PRODUCTOS TEXTILES', 'no', 147);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13910', 'FABRICACIÓN DE TEJIDOS DE PUNTO Y GANCHILLO ', 'no', 148);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13921', 'FABRICACIÓN DE PRODUCTOS TEXTILES PARA EL HOGAR', 'no', 149);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13922', 'SACOS, BOLSAS Y OTROS ARTÍCULOS TEXTILES', 'no', 150);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13929', 'FABRICACIÓN DE ARTÍCULOS CONFECCIONADOS CON MATERIALES TEXTILES, EXCEPTO PRENDAS DE VESTIR N.C.P', 'no', 151);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13930', 'FABRICACIÓN DE TAPICES Y ALFOMBRAS', 'no', 152);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13941', 'FABRICACIÓN DE CUERDAS DE HENEQUÉN Y OTRAS FIBRAS NATURALES (LAZOS, PITAS)', 'no', 153);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13942', 'FABRICACIÓN DE REDES DE DIVERSOS MATERIALES', 'no', 154);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13948', 'MAQUILADO DE PRODUCTOS TRENZABLES DE CUALQUIER MATERIAL (PETATES, SILLAS, ETC.)', 'no', 155);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13991', 'FABRICACIÓN DE ADORNOS, ETIQUETAS Y OTROS ARTÍCULOS PARA PRENDAS DE VESTIR', 'no', 156);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13992', 'SERVICIO DE BORDADOS EN ARTÍCULOS Y PRENDAS DE TELA', 'no', 157);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('13999', 'FABRICACIÓN DE PRODUCTOS TEXTILES NCP', 'no', 158);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14101', 'FABRICACIÓN DE ROPA INTERIOR, PARA DORMIR Y SIMILARES', 'no', 160);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14102', 'FABRICACIÓN DE ROPA PARA NIÑOS', 'no', 161);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14103', 'FABRICACIÓN DE PRENDAS DE VESTIR PARA AMBOS SEXOS', 'no', 162);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14104', 'CONFECCIÓN DE PRENDAS A MEDIDA', 'no', 163);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14105', 'FABRICACIÓN DE PRENDAS DE VESTIR PARA DEPORTES', 'no', 164);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14106', 'ELABORACIÓN DE ARTESANÍAS DE USO PERSONAL CONFECCIONADAS ESPECIALMENTE DE MATERIALES TEXTILES', 'no', 165);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14108', 'MAQUILADO DE PRENDAS DE VESTIR, ACCESORIOS Y OTROS', 'no', 166);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14109', 'FABRICACIÓN DE PRENDAS Y ACCESORIOS DE VESTIR N.C.P.', 'no', 167);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14200', 'FABRICACIÓN DE ARTÍCULOS DE PIEL', 'no', 168);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14301', 'FABRICACIÓN DE CALCETINES, CALCETAS, MEDIAS (PANTY HOUSE) Y OTROS SIMILARES', 'no', 169);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14302', 'FABRICACIÓN DE ROPA INTERIOR DE TEJIDO DE PUNTO', 'no', 170);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('14309', 'FABRICACIÓN DE PRENDAS DE VESTIR DE TEJIDO DE PUNTO NCP', 'no', 171);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('15110', 'CURTIDO Y ADOBO DE CUEROS; ADOBO Y TEÑIDO DE PIELES', 'no', 173);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('15121', 'FABRICACIÓN DE MALETAS, BOLSOS DE MANO Y OTROS ARTÍCULOS DE MARROQUINERÍA', 'no', 174);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('15122', 'FABRICACIÓN DE MONTURAS, ACCESORIOS Y VAINAS TALABARTERÍA', 'no', 175);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('15123', 'FABRICACIÓN DE ARTESANÍAS PRINCIPALMENTE DE CUERO NATURAL Y SINTÉTICO', 'no', 176);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('15128', 'MAQUILADO DE ARTÍCULOS DE CUERO NATURAL, SINTÉTICO Y DE OTROS MATERIALES', 'no', 177);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('15201', 'FABRICACIÓN DE CALZADO', 'no', 178);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('15202', 'FABRICACIÓN DE PARTES Y ACCESORIOS DE CALZADO ', 'no', 179);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('15208', 'MAQUILADO DE PARTES Y ACCESORIOS DE CALZADO', 'no', 180);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('16100', 'ASERRADERO Y ACEPILLADURA DE MADERA', 'no', 182);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('16210', 'FABRICACIÓN DE MADERA LAMINADA, TERCIADA, ENCHAPADA Y CONTRACHAPADA, PANELES PARA LA CONSTRUCCIÓN', 'no', 183);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('16220', 'FABRICACIÓN DE PARTES Y PIEZAS DE CARPINTERÍA PARA EDIFICIOS Y CONSTRUCCIONES', 'no', 184);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('16230', 'FABRICACIÓN DE ENVASES Y RECIPIENTES DE MADERA', 'no', 185);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('16292', 'FABRICACIÓN DE ARTESANÍAS DE MADERA, SEMILLAS, MATERIALES TRENZABLES', 'no', 186);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('16299', 'FABRICACIÓN DE PRODUCTOS DE MADERA, CORCHO, PAJA Y MATERIALES TRENZABLES NCP', 'no', 187);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('17010', 'FABRICACIÓN DE PASTA DE MADERA, PAPEL Y CARTÓN', 'no', 189);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('17020', 'FABRICACIÓN DE PAPEL Y CARTÓN ONDULADO Y ENVASES DE PAPEL Y CARTÓN', 'no', 190);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('17091', 'FABRICACIÓN DE ARTÍCULOS DE PAPEL Y CARTÓN DE USO PERSONAL Y DOMÉSTICO', 'no', 191);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('17092', 'FABRICACIÓN DE PRODUCTOS DE PAPEL NCP', 'no', 192);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('18110', 'IMPRESIÓN', 'no', 194);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('18120', 'SERVICIOS RELACIONADOS CON LA IMPRESIÓN', 'no', 195);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('18200', 'REPRODUCCIÓN DE GRABACIONES', 'no', 196);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('19100', 'FABRICACIÓN DE PRODUCTOS DE HORNOS DE COQUE', 'no', 198);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('19201', 'FABRICACIÓN DE COMBUSTIBLE', 'no', 199);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('19202', 'FABRICACIÓN DE ACEITES Y LUBRICANTES', 'no', 200);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20111', 'FABRICACIÓN DE MATERIAS PRIMAS PARA LA FABRICACIÓN DE COLORANTES', 'no', 202);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20112', 'FABRICACIÓN DE MATERIALES CURTIENTES', 'no', 203);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20113', 'FABRICACIÓN DE GASES INDUSTRIALES', 'no', 204);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20114', 'FABRICACIÓN DE ALCOHOL ETÍLICO', 'no', 205);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20119', 'FABRICACIÓN DE SUSTANCIAS QUÍMICAS BÁSICAS', 'no', 206);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20120', 'FABRICACIÓN DE ABONOS Y FERTILIZANTES', 'no', 207);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20130', 'FABRICACIÓN DE PLÁSTICO Y CAUCHO EN FORMAS PRIMARIAS', 'no', 208);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20210', 'FABRICACIÓN DE PLAGUICIDAS Y OTROS PRODUCTOS QUÍMICOS DE USO AGROPECUARIO', 'no', 209);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20220', 'FABRICACIÓN DE PINTURAS, BARNICES Y PRODUCTOS DE REVESTIMIENTO SIMILARES; TINTAS DE IMPRENTA Y MASILLAS', 'no', 210);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20231', 'FABRICACIÓN DE JABONES, DETERGENTES Y SIMILARES PARA LIMPIEZA', 'no', 211);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20232', 'FABRICACIÓN DE PERFUMES, COSMÉTICOS Y PRODUCTOS DE HIGIENE Y CUIDADO PERSONAL, INCLUYENDO TINTES, CHAMPÚ, ETC.', 'no', 212);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20291', 'FABRICACIÓN DE TINTAS Y COLORES PARA ESCRIBIR Y PINTAR; FABRICACIÓN DE CINTAS PARA IMPRESORAS', 'no', 213);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20292', 'FABRICACIÓN DE PRODUCTOS PIROTÉCNICOS, EXPLOSIVOS Y MUNICIONES', 'no', 214);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20299', 'FABRICACIÓN DE PRODUCTOS QUÍMICOS N.C.P.', 'no', 215);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('20300', 'FABRICACIÓN DE FIBRAS ARTIFICIALES', 'no', 216);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('21001', 'MANUFACTURA DE PRODUCTOS FARMACÉUTICOS, SUSTANCIAS QUÍMICAS Y PRODUCTOS BOTÁNICOS', 'no', 218);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('21008', 'MAQUILADO DE MEDICAMENTOS', 'no', 219);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('22110', 'FABRICACIÓN DE CUBIERTAS Y CÁMARAS; RENOVACIÓN Y RECAUCHUTADO DE CUBIERTAS', 'no', 221);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('22190', 'FABRICACIÓN DE OTROS PRODUCTOS DE CAUCHO', 'no', 222);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('22201', 'FABRICACIÓN DE ENVASES PLÁSTICOS', 'no', 223);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('22202', 'FABRICACIÓN DE PRODUCTOS PLÁSTICOS PARA USO PERSONAL O DOMÉSTICO', 'no', 224);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('22208', 'MAQUILA DE PLÁSTICOS', 'no', 225);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('22209', 'FABRICACIÓN DE PRODUCTOS PLÁSTICOS N.C.P.', 'no', 226);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23101', 'FABRICACIÓN DE VIDRIO', 'no', 228);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23102', 'FABRICACIÓN DE RECIPIENTES Y ENVASES DE VIDRIO', 'no', 229);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23108', 'SERVICIO DE MAQUILADO', 'no', 230);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23109', 'FABRICACIÓN DE PRODUCTOS DE VIDRIO NCP', 'no', 231);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23910', 'FABRICACIÓN DE PRODUCTOS REFRACTARIOS', 'no', 232);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23920', 'FABRICACIÓN DE PRODUCTOS DE ARCILLA PARA LA CONSTRUCCIÓN', 'no', 233);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23931', 'FABRICACIÓN DE PRODUCTOS DE CERÁMICA Y PORCELANA NO REFRACTARIA', 'no', 234);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23932', 'FABRICACIÓN DE PRODUCTOS DE CERÁMICA Y PORCELANA NCP', 'no', 235);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23940', 'FABRICACIÓN DE CEMENTO, CAL Y YESO', 'no', 236);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23950', 'FABRICACIÓN DE ARTÍCULOS DE HORMIGÓN, CEMENTO Y YESO', 'no', 237);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23960', 'CORTE, TALLADO Y ACABADO DE LA PIEDRA', 'no', 238);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('23990', 'FABRICACIÓN DE PRODUCTOS MINERALES NO METÁLICOS NCP', 'no', 239);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('24100', 'INDUSTRIAS BÁSICAS DE HIERRO Y ACERO', 'no', 241);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('24200', 'FABRICACIÓN DE PRODUCTOS PRIMARIOS DE METALES PRECIOSOS Y METALES NO FERROSOS', 'no', 242);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('24310', 'FUNDICIÓN DE HIERRO Y ACERO', 'no', 243);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('24320', 'FUNDICIÓN DE METALES NO FERROSOS', 'no', 244);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25111', 'FABRICACIÓN DE PRODUCTOS METÁLICOS PARA USO ESTRUCTURAL', 'no', 246);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25118', 'SERVICIO DE MAQUILA PARA LA FABRICACIÓN DE ESTRUCTURAS METÁLICAS', 'no', 247);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25120', 'FABRICACIÓN DE TANQUES, DEPÓSITOS Y RECIPIENTES DE METAL', 'no', 248);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25130', 'FABRICACIÓN DE GENERADORES DE VAPOR, EXCEPTO CALDERAS DE AGUA CALIENTE PARA CALEFACCIÓN CENTRAL', 'no', 249);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25200', 'FABRICACIÓN DE ARMAS Y MUNICIONES', 'no', 250);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25910', 'FORJADO, PRENSADO, ESTAMPADO Y LAMINADO DE METALES; PULVIMETALURGIA', 'no', 251);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25920', 'TRATAMIENTO Y REVESTIMIENTO DE METALES', 'no', 252);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25930', 'FABRICACIÓN DE ARTÍCULOS DE CUCHILLERÍA, HERRAMIENTAS DE MANO Y ARTÍCULOS DE FERRETERÍA', 'no', 253);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25991', 'FABRICACIÓN DE ENVASES Y ARTÍCULOS CONEXOS DE METAL', 'no', 254);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25992', 'FABRICACIÓN DE ARTÍCULOS METÁLICOS DE USO PERSONAL Y/O DOMÉSTICO', 'no', 255);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('25999', 'FABRICACIÓN DE PRODUCTOS ELABORADOS DE METAL NCP', 'no', 256);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('26100', 'FABRICACIÓN DE COMPONENTES ELECTRÓNICOS', 'no', 258);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('26200', 'FABRICACIÓN DE COMPUTADORAS Y EQUIPO CONEXO', 'no', 259);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('26300', 'FABRICACIÓN DE EQUIPO DE COMUNICACIONES', 'no', 260);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('26400', 'FABRICACIÓN DE APARATOS ELECTRÓNICOS DE CONSUMO PARA AUDIO, VIDEO RADIO Y TELEVISIÓN', 'no', 261);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('26510', 'FABRICACIÓN DE INSTRUMENTOS Y APARATOS PARA MEDIR, VERIFICAR, ENSAYAR, NAVEGAR Y DE CONTROL DE PROCESOS INDUSTRIALES', 'no', 262);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('26520', 'FABRICACIÓN DE RELOJES Y PIEZAS DE RELOJES', 'no', 263);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('26600', 'FABRICACIÓN DE EQUIPO MÉDICO DE IRRADIACIÓN Y EQUIPO ELECTRÓNICO DE USO MÉDICO Y TERAPÉUTICO', 'no', 264);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('26700', 'FABRICACIÓN DE INSTRUMENTOS DE ÓPTICA Y EQUIPO FOTOGRÁFICO', 'no', 265);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('26800', 'FABRICACIÓN DE MEDIOS MAGNÉTICOS Y ÓPTICOS', 'no', 266);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('27100', 'FABRICACIÓN DE MOTORES, GENERADORES, TRANSFORMADORES ELÉCTRICOS, APARATOS DE DISTRIBUCIÓN Y CONTROL DE ELECTRICIDAD', 'no', 268);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('27200', 'FABRICACIÓN DE PILAS, BATERÍAS Y ACUMULADORES', 'no', 269);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('27310', 'FABRICACIÓN DE CABLES DE FIBRA ÓPTICA', 'no', 270);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('27320', 'FABRICACIÓN DE OTROS HILOS Y CABLES ELÉCTRICOS', 'no', 271);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('27330', 'FABRICACIÓN DE DISPOSITIVOS DE CABLEADOS', 'no', 272);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('27400', 'FABRICACIÓN DE EQUIPO ELÉCTRICO DE ILUMINACIÓN', 'no', 273);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('27500', 'FABRICACIÓN DE APARATOS DE USO DOMÉSTICO', 'no', 274);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('27900', 'FABRICACIÓN DE OTROS TIPOS DE EQUIPO ELÉCTRICO', 'no', 275);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28110', 'FABRICACIÓN DE MOTORES Y TURBINAS, EXCEPTO MOTORES PARA AERONAVES, VEHÍCULOS AUTOMOTORES Y MOTOCICLETAS', 'no', 277);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28120', 'FABRICACIÓN DE EQUIPO HIDRÁULICO', 'no', 278);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28130', 'FABRICACIÓN DE OTRAS BOMBAS, COMPRESORES, GRIFOS Y VÁLVULAS', 'no', 279);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28140', 'FABRICACIÓN DE COJINETES, ENGRANAJES, TRENES DE ENGRANAJES Y PIEZAS DE TRANSMISIÓN', 'no', 280);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28150', 'FABRICACIÓN DE HORNOS Y QUEMADORES', 'no', 281);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28160', 'FABRICACIÓN DE EQUIPO DE ELEVACIÓN Y MANIPULACIÓN', 'no', 282);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28170', 'FABRICACIÓN DE MAQUINARIA Y EQUIPO DE OFICINA', 'no', 283);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28180', 'FABRICACIÓN DE HERRAMIENTAS MANUALES', 'no', 284);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28190', 'FABRICACIÓN DE OTROS TIPOS DE MAQUINARIA DE USO GENERAL', 'no', 285);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28210', 'FABRICACIÓN DE MAQUINARIA AGROPECUARIA Y FORESTAL', 'no', 286);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28220', 'FABRICACIÓN DE MÁQUINAS PARA CONFORMAR METALES Y MAQUINARIA HERRAMIENTA', 'no', 287);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28230', 'FABRICACIÓN DE MAQUINARIA METALÚRGICA', 'no', 288);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28240', 'FABRICACIÓN DE MAQUINARIA PARA LA EXPLOTACIÓN DE MINAS Y CANTERAS Y PARA OBRAS DE CONSTRUCCIÓN', 'no', 289);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28250', 'FABRICACIÓN DE MAQUINARIA PARA LA ELABORACIÓN DE ALIMENTOS, BEBIDAS Y TABACO', 'no', 290);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28260', 'FABRICACIÓN DE MAQUINARIA PARA LA ELABORACIÓN DE PRODUCTOS TEXTILES, PRENDAS DE VESTIR Y CUEROS', 'no', 291);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28291', 'FABRICACIÓN DE MÁQUINAS PARA IMPRENTA', 'no', 292);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('28299', 'FABRICACIÓN DE MAQUINARIA DE USO ESPECIAL NCP', 'no', 293);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('29100', 'FABRICACIÓN VEHÍCULOS AUTOMOTORES', 'no', 295);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('29200', 'FABRICACIÓN DE CARROCERÍAS PARA VEHÍCULOS AUTOMOTORES; FABRICACIÓN DE REMOLQUES Y SEMIREMOLQUES', 'no', 296);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('29300', 'FABRICACIÓN DE PARTES, PIEZAS Y ACCESORIOS PARA VEHÍCULOS AUTOMOTORES', 'no', 297);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('30110', 'FABRICACIÓN DE BUQUES', 'no', 299);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('30120', 'CONSTRUCCIÓN Y REPARACIÓN DE EMBARCACIONES DE RECREO', 'no', 300);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('30200', 'FABRICACIÓN DE LOCOMOTORAS Y DE MATERIAL RODANTE', 'no', 301);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('30300', 'FABRICACIÓN DE AERONAVES Y NAVES ESPACIALES', 'no', 302);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('30400', 'FABRICACIÓN DE VEHÍCULOS MILITARES DE COMBATE', 'no', 303);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('30910', 'FABRICACIÓN DE MOTOCICLETAS', 'no', 304);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('30920', 'FABRICACIÓN DE BICICLETAS Y SILLONES DE RUEDAS PARA INVÁLIDOS', 'no', 305);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('30990', 'FABRICACIÓN DE EQUIPO DE TRANSPORTE NCP', 'no', 306);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('31001', 'FABRICACIÓN DE COLCHONES Y SOMIER', 'no', 308);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('31002', 'FABRICACIÓN DE MUEBLES Y OTROS PRODUCTOS DE MADERA A MEDIDA', 'no', 309);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('31008', 'SERVICIOS DE MAQUILADO DE MUEBLES', 'no', 310);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('31009', 'FABRICACIÓN DE MUEBLES NCP', 'no', 311);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32110', 'FABRICACIÓN DE JOYAS PLATERÍAS Y JOYERÍAS', 'no', 313);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32120', 'FABRICACIÓN DE JOYAS DE IMITACIÓN (FANTASÍA) Y ARTÍCULOS CONEXOS', 'no', 314);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32200', 'FABRICACIÓN DE INSTRUMENTOS MUSICALES', 'no', 315);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32301', 'FABRICACIÓN DE ARTÍCULOS DE DEPORTE', 'no', 316);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32308', 'SERVICIO DE MAQUILA DE PRODUCTOS DEPORTIVOS', 'no', 317);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32401', 'FABRICACIÓN DE JUEGOS DE MESA Y DE SALÓN', 'no', 318);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32402', 'SERVICIO DE MAQUILADO DE JUGUETES Y JUEGOS', 'no', 319);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32409', 'FABRICACIÓN DE JUEGOS Y JUGUETES N.C.P.', 'no', 320);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32500', 'FABRICACIÓN DE INSTRUMENTOS Y MATERIALES MÉDICOS Y ODONTOLÓGICOS', 'no', 321);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32901', 'FABRICACIÓN DE LÁPICES, BOLÍGRAFOS, SELLOS Y ARTÍCULOS DE LIBRERÍA EN GENERAL', 'no', 322);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32902', 'FABRICACIÓN DE ESCOBAS, CEPILLOS, PINCELES Y SIMILARES', 'no', 323);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32903', 'FABRICACIÓN DE ARTESANÍAS DE MATERIALES DIVERSOS', 'no', 324);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32904', 'FABRICACIÓN DE ARTÍCULOS DE USO PERSONAL Y DOMÉSTICOS N.C.P.', 'no', 325);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32905', 'FABRICACIÓN DE ACCESORIOS PARA LAS CONFECCIONES Y LA MARROQUINERÍA N.C.P.', 'no', 326);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32908', 'SERVICIOS DE MAQUILA NCP', 'no', 327);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('32909', 'FABRICACIÓN DE PRODUCTOS MANUFACTURADOS N.C.P.', 'no', 328);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('33110', 'REPARACIÓN Y MANTENIMIENTO DE PRODUCTOS ELABORADOS DE METAL', 'no', 330);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('33120', 'REPARACIÓN Y MANTENIMIENTO DE MAQUINARIA', 'no', 331);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('33130', 'REPARACIÓN Y MANTENIMIENTO DE EQUIPO ELECTRÓNICO Y ÓPTICO', 'no', 332);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('33140', 'REPARACIÓN Y MANTENIMIENTO DE EQUIPO ELÉCTRICO', 'no', 333);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('33150', 'REPARACIÓN Y MANTENIMIENTO DE EQUIPO DE TRANSPORTE, EXCEPTO VEHÍCULOS AUTOMOTORES', 'no', 334);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('33190', 'REPARACIÓN Y MANTENIMIENTO DE EQUIPOS N.C.P.', 'no', 335);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('33200', 'INSTALACIÓN DE MAQUINARIA Y EQUIPO INDUSTRIAL', 'no', 336);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('35101', 'GENERACIÓN DE ENERGÍA ELÉCTRICA', 'no', 338);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('35102', 'TRANSMISIÓN DE ENERGÍA ELÉCTRICA', 'no', 339);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('35103', 'DISTRIBUCIÓN DE ENERGÍA ELÉCTRICA', 'no', 340);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('35200', 'FABRICACIÓN DE GAS, DISTRIBUCIÓN DE COMBUSTIBLES GASEOSOS POR TUBERÍAS', 'no', 341);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('35300', 'SUMINISTRO DE VAPOR Y AGUA CALIENTE', 'no', 342);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('36000', 'CAPTACIÓN, TRATAMIENTO Y SUMINISTRO DE AGUA', 'no', 345);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('37000', 'EVACUACIÓN DE AGUAS RESIDUALES (ALCANTARILLADO)', 'no', 347);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38110', 'RECOLECCIÓN Y TRANSPORTE DE DESECHOS SÓLIDOS PROVENIENTE DE HOGARES Y SECTOR URBANO', 'no', 349);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38120', 'RECOLECCIÓN DE DESECHOS PELIGROSOS', 'no', 350);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38210', 'TRATAMIENTO Y ELIMINACIÓN DE DESECHOS INICUOS', 'no', 351);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38220', 'TRATAMIENTO Y ELIMINACIÓN DE DESECHOS PELIGROSOS', 'no', 352);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38301', 'RECICLAJE DE DESPERDICIOS Y DESECHOS TEXTILES', 'no', 353);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38302', 'RECICLAJE DE DESPERDICIOS Y DESECHOS DE PLÁSTICO Y CAUCHO', 'no', 354);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38303', 'RECICLAJE DE DESPERDICIOS Y DESECHOS DE VIDRIO', 'no', 355);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38304', 'RECICLAJE DE DESPERDICIOS Y DESECHOS DE PAPEL Y CARTÓN', 'no', 356);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38305', 'RECICLAJE DE DESPERDICIOS Y DESECHOS METÁLICOS', 'no', 357);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('38309', 'RECICLAJE DE DESPERDICIOS Y DESECHOS NO METÁLICOS N.C.P.', 'no', 358);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('39000', 'ACTIVIDADES DE SANEAMIENTO Y OTROS SERVICIOS DE GESTIÓN DE DESECHOS', 'no', 360);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('41001', 'CONSTRUCCIÓN DE EDIFICIOS RESIDENCIALES', 'no', 363);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('41002', 'CONSTRUCCIÓN DE EDIFICIOS NO RESIDENCIALES', 'no', 364);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('42100', 'CONSTRUCCIÓN DE CARRETERAS, CALLES Y CAMINOS', 'no', 366);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('42200', 'CONSTRUCCIÓN DE PROYECTOS DE SERVICIO PÚBLICO', 'no', 367);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('42900', 'CONSTRUCCIÓN DE OBRAS DE INGENIERÍA CIVIL N.C.P.', 'no', 368);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('43110', 'DEMOLICIÓN', 'no', 370);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('43120', 'PREPARACIÓN DE TERRENO', 'no', 371);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('43210', 'INSTALACIONES ELÉCTRICAS', 'no', 372);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('43220', 'INSTALACIÓN DE FONTANERÍA, CALEFACCIÓN Y AIRE ACONDICIONADO', 'no', 373);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('43290', 'OTRAS INSTALACIONES PARA OBRAS DE CONSTRUCCIÓN', 'no', 374);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('43300', 'TERMINACIÓN Y ACABADO DE EDIFICIOS', 'no', 375);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('43900', 'OTRAS ACTIVIDADES ESPECIALIZADAS DE CONSTRUCCIÓN', 'no', 376);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('43901', 'FABRICACIÓN DE TECHOS Y MATERIALES DIVERSOS', 'no', 377);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45100', 'VENTA DE VEHÍCULOS AUTOMOTORES', 'no', 379);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45201', 'REPARACIÓN MECÁNICA DE VEHÍCULOS AUTOMOTORES', 'no', 380);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45202', 'REPARACIONES ELÉCTRICAS DEL AUTOMOTOR Y RECARGA DE BATERÍAS', 'no', 381);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45203', 'ENDEREZADO Y PINTURA DE VEHÍCULOS AUTOMOTORES', 'no', 382);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45204', 'REPARACIONES DE RADIADORES, ESCAPES Y SILENCIADORES', 'no', 383);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45205', 'REPARACIÓN Y RECONSTRUCCIÓN DE VÍAS, STOP Y OTROS ARTÍCULOS DE FIBRA DE VIDRIO', 'no', 384);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45206', 'REPARACIÓN DE LLANTAS DE VEHÍCULOS AUTOMOTORES', 'no', 385);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45207', 'POLARIZADO DE VEHÍCULOS (MEDIANTE LA ADHESIÓN DE PAPEL ESPECIAL A LOS VIDRIOS)', 'no', 386);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45208', 'LAVADO Y PASTEADO DE VEHÍCULOS (CARWASH)', 'no', 387);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45209', 'REPARACIONES DE VEHÍCULOS N.C.P.', 'no', 388);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45211', 'REMOLQUE DE VEHÍCULOS AUTOMOTORES', 'no', 389);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45301', 'VENTA DE PARTES, PIEZAS Y ACCESORIOS NUEVOS PARA VEHÍCULOS AUTOMOTORES', 'no', 390);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45302', 'VENTA DE PARTES, PIEZAS Y ACCESORIOS USADOS PARA VEHÍCULOS AUTOMOTORES', 'no', 391);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45401', 'VENTA DE MOTOCICLETAS', 'no', 392);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45402', 'VENTA DE REPUESTOS, PIEZAS Y ACCESORIOS DE MOTOCICLETAS', 'no', 393);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('45403', 'MANTENIMIENTO Y REPARACIÓN DE MOTOCICLETAS', 'no', 394);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46100', 'VENTA AL POR MAYOR A CAMBIO DE RETRIBUCIÓN O POR CONTRATA', 'no', 396);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46201', 'VENTA AL POR MAYOR DE MATERIAS PRIMAS AGRÍCOLAS', 'no', 397);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46202', 'VENTA AL POR MAYOR DE PRODUCTOS DE LA SILVICULTURA', 'no', 398);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46203', 'VENTA AL POR MAYOR DE PRODUCTOS PECUARIOS Y DE GRANJA', 'no', 399);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46211', 'VENTA DE PRODUCTOS PARA USO AGROPECUARIO', 'no', 400);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46291', 'VENTA AL POR MAYOR DE GRANOS BÁSICOS (CEREALES, LEGUMINOSAS)', 'no', 401);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46292', 'VENTA AL POR MAYOR DE SEMILLAS MEJORADAS PARA CULTIVO', 'no', 402);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46293', 'VENTA AL POR MAYOR DE CAFÉ ORO Y UVA', 'no', 403);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46294', 'VENTA AL POR MAYOR DE CAÑA DE AZÚCAR', 'no', 404);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46295', 'VENTA AL POR MAYOR DE FLORES, PLANTAS Y OTROS PRODUCTOS NATURALES', 'no', 405);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46296', 'VENTA AL POR MAYOR DE PRODUCTOS AGRÍCOLAS', 'no', 406);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46297', 'VENTA AL POR MAYOR DE GANADO BOVINO (VIVO)', 'no', 407);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46298', 'VENTA AL POR MAYOR DE ANIMALES PORCINOS, OVINOS, CAPRINO, CANÍCULAS, APÍCOLAS, AVÍCOLAS VIVOS', 'no', 408);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46299', 'VENTA DE OTRAS ESPECIES VIVAS DEL REINO ANIMAL', 'no', 409);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46301', 'VENTA AL POR MAYOR DE ALIMENTOS', 'no', 410);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46302', 'VENTA AL POR MAYOR DE BEBIDAS', 'no', 411);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46303', 'VENTA AL POR MAYOR DE TABACO', 'no', 412);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46371', 'VENTA AL POR MAYOR DE FRUTAS, HORTALIZAS (VERDURAS), LEGUMBRES Y TUBÉRCULOS', 'no', 413);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46372', 'VENTA AL POR MAYOR DE POLLOS, GALLINAS DESTAZADAS, PAVOS Y OTRAS AVES', 'no', 414);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46373', 'VENTA AL POR MAYOR DE CARNE BOVINA Y PORCINA, PRODUCTOS DE CARNE Y EMBUTIDOS', 'no', 415);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46374', 'VENTA AL POR MAYOR DE HUEVOS', 'no', 416);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46375', 'VENTA AL POR MAYOR DE PRODUCTOS LÁCTEOS', 'no', 417);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46376', 'VENTA AL POR MAYOR DE PRODUCTOS FARINÁCEOS DE PANADERÍA (PAN DULCE, CAKES, REPOSTERÍA, ETC.)', 'no', 418);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46377', 'VENTA AL POR MAYOR DE PASTAS ALIMENTICIAS, ACEITES Y GRASAS COMESTIBLES VEGETAL Y ANIMAL', 'no', 419);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46378', 'VENTA AL POR MAYOR DE SAL COMESTIBLE', 'no', 420);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46379', 'VENTA AL POR MAYOR DE AZÚCAR', 'no', 421);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46391', 'VENTA AL POR MAYOR DE ABARROTES (VINOS, LICORES, PRODUCTOS ALIMENTICIOS ENVASADOS, ETC.)', 'no', 422);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46392', 'VENTA AL POR MAYOR DE AGUAS GASEOSAS', 'no', 423);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46393', 'VENTA AL POR MAYOR DE AGUA PURIFICADA', 'no', 424);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46394', 'VENTA AL POR MAYOR DE REFRESCOS Y OTRAS BEBIDAS, LÍQUIDAS O EN POLVO', 'no', 425);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46395', 'VENTA AL POR MAYOR DE CERVEZA Y LICORES', 'no', 426);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46396', 'VENTA AL POR MAYOR DE HIELO', 'no', 427);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46411', 'VENTA AL POR MAYOR DE HILADOS, TEJIDOS Y PRODUCTOS TEXTILES DE MERCERÍA', 'no', 428);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46412', 'VENTA AL POR MAYOR DE ARTÍCULOS TEXTILES EXCEPTO CONFECCIONES PARA EL HOGAR', 'no', 429);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46413', 'VENTA AL POR MAYOR DE CONFECCIONES TEXTILES PARA EL HOGAR', 'no', 430);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46414', 'VENTA AL POR MAYOR DE PRENDAS DE VESTIR Y ACCESORIOS DE VESTIR', 'no', 431);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46415', 'VENTA AL POR MAYOR DE ROPA USADA', 'no', 432);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46416', 'VENTA AL POR MAYOR DE CALZADO', 'no', 433);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46417', 'VENTA AL POR MAYOR DE ARTÍCULOS DE MARROQUINERÍA Y TALABARTERÍA', 'no', 434);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46418', 'VENTA AL POR MAYOR DE ARTÍCULOS DE PELETERÍA', 'no', 435);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46419', 'VENTA AL POR MAYOR DE OTROS ARTÍCULOS TEXTILES N.C.P.', 'no', 436);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46471', 'VENTA AL POR MAYOR DE INSTRUMENTOS MUSICALES', 'no', 437);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46472', 'VENTA AL POR MAYOR DE COLCHONES, ALMOHADAS, COJINES, ETC.', 'no', 438);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46473', 'VENTA AL POR MAYOR DE ARTÍCULOS DE ALUMINIO PARA EL HOGAR Y PARA OTROS USOS', 'no', 439);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46474', 'VENTA AL POR MAYOR DE DEPÓSITOS Y OTROS ARTÍCULOS PLÁSTICOS PARA EL HOGAR Y OTROS USOS, INCLUYENDO LOS DESECHABLES DE DURAPAX Y NO DESECHABLES', 'no', 440);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46475', 'VENTA AL POR MAYOR DE CÁMARAS FOTOGRÁFICAS, ACCESORIOS Y MATERIALES', 'no', 441);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46482', 'VENTA AL POR MAYOR DE MEDICAMENTOS, ARTÍCULOS Y OTROS PRODUCTOS DE USO VETERINARIO', 'no', 442);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46483', 'VENTA AL POR MAYOR DE PRODUCTOS Y ARTÍCULOS DE BELLEZA Y DE USO PERSONAL', 'no', 443);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46484', 'VENTA DE PRODUCTOS FARMACÉUTICOS Y MEDICINALES', 'no', 444);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46491', 'VENTA AL POR MAYOR DE PRODUCTOS MEDICINALES, COSMÉTICOS, PERFUMERÍA Y PRODUCTOS DE LIMPIEZA', 'no', 445);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46492', 'VENTA AL POR MAYOR DE RELOJES Y ARTÍCULOS DE JOYERÍA', 'no', 446);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46493', 'VENTA AL POR MAYOR DE ELECTRODOMÉSTICOS Y ARTÍCULOS DEL HOGAR EXCEPTO BAZAR; ARTÍCULOS DE ILUMINACIÓN', 'no', 447);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46494', 'VENTA AL POR MAYOR DE ARTÍCULOS DE BAZAR Y SIMILARES', 'no', 448);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46495', 'VENTA AL POR MAYOR DE ARTÍCULOS DE ÓPTICA', 'no', 449);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46496', 'VENTA AL POR MAYOR DE REVISTAS, PERIÓDICOS, LIBROS, ARTÍCULOS DE LIBRERÍA Y ARTÍCULOS DE PAPEL Y CARTÓN EN GENERAL', 'no', 450);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46497', 'VENTA DE ARTÍCULOS DEPORTIVOS, JUGUETES Y RODADOS', 'no', 451);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46498', 'VENTA AL POR MAYOR DE PRODUCTOS USADOS PARA EL HOGAR O EL USO PERSONAL', 'no', 452);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46499', 'VENTA AL POR MAYOR DE ENSERES DOMÉSTICOS Y DE USO PERSONAL N.C.P.', 'no', 453);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46500', 'VENTA AL POR MAYOR DE BICICLETAS, PARTES, ACCESORIOS Y OTROS', 'no', 454);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46510', 'VENTA AL POR MAYOR DE COMPUTADORAS, EQUIPO PERIFÉRICO Y PROGRAMAS INFORMÁTICOS', 'no', 455);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46520', 'VENTA AL POR MAYOR DE EQUIPOS DE COMUNICACIÓN', 'no', 456);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46530', 'VENTA AL POR MAYOR DE MAQUINARIA Y EQUIPO AGROPECUARIO, ACCESORIOS, PARTES Y SUMINISTROS', 'no', 457);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46590', 'VENTA DE EQUIPOS E INSTRUMENTOS DE USO PROFESIONAL Y CIENTÍFICO Y APARATOS DE MEDIDA Y CONTROL', 'no', 458);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46591', 'VENTA AL POR MAYOR DE MAQUINARIA EQUIPO, ACCESORIOS Y MATERIALES PARA LA INDUSTRIA DE LA MADERA Y SUS PRODUCTOS', 'no', 459);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46592', 'VENTA AL POR MAYOR DE MAQUINARIA, EQUIPO, ACCESORIOS Y MATERIALES PARA LA INDUSTRIA GRÁFICA Y DEL PAPEL, CARTÓN Y PRODUCTOS DE PAPEL Y CARTÓN', 'no', 460);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46593', 'VENTA AL POR MAYOR DE MAQUINARIA, EQUIPO, ACCESORIOS Y MATERIALES PARA LA INDUSTRIA DE PRODUCTOS QUÍMICOS, PLÁSTICO Y CAUCHO', 'no', 461);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46594', 'VENTA AL POR MAYOR DE MAQUINARIA, EQUIPO, ACCESORIOS Y MATERIALES PARA LA INDUSTRIA METÁLICA Y DE SUS PRODUCTOS', 'no', 462);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46595', 'VENTA AL POR MAYOR DE EQUIPAMIENTO PARA USO MÉDICO, ODONTOLÓGICO, VETERINARIO Y SERVICIOS CONEXOS', 'no', 463);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46596', 'VENTA AL POR MAYOR DE MAQUINARIA, EQUIPO, ACCESORIOS Y PARTES PARA LA INDUSTRIA DE LA ALIMENTACIÓN', 'no', 464);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46597', 'VENTA AL POR MAYOR DE MAQUINARIA, EQUIPO, ACCESORIOS Y PARTES PARA LA INDUSTRIA TEXTIL, CONFECCIONES Y CUERO', 'no', 465);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46598', 'VENTA AL POR MAYOR DE MAQUINARIA, EQUIPO Y ACCESORIOS PARA LA CONSTRUCCIÓN Y EXPLOTACIÓN DE MINAS Y CANTERAS', 'no', 466);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46599', 'VENTA AL POR MAYOR DE OTRO TIPO DE MAQUINARIA Y EQUIPO CON SUS ACCESORIOS Y PARTES', 'no', 467);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46610', 'VENTA AL POR MAYOR DE OTROS COMBUSTIBLES SÓLIDOS, LÍQUIDOS, GASEOSOS Y DE PRODUCTOS CONEXOS', 'no', 468);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46612', 'VENTA AL POR MAYOR DE COMBUSTIBLES PARA AUTOMOTORES, AVIONES, BARCOS, MAQUINARIA Y OTROS', 'no', 469);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46613', 'VENTA AL POR MAYOR DE LUBRICANTES, GRASAS Y OTROS ACEITES PARA AUTOMOTORES, MAQUINARIA INDUSTRIAL, ETC.', 'no', 470);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46614', 'VENTA AL POR MAYOR DE GAS PROPANO', 'no', 471);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46615', 'VENTA AL POR MAYOR DE LEÑA Y CARBÓN', 'no', 472);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46620', 'VENTA AL POR MAYOR DE METALES Y MINERALES METALÍFEROS', 'no', 473);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46631', 'VENTA AL POR MAYOR DE PUERTAS, VENTANAS, VITRINAS Y SIMILARES', 'no', 474);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46632', 'VENTA AL POR MAYOR DE ARTÍCULOS DE FERRETERÍA Y PINTURERÍAS', 'no', 475);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46633', 'VIDRIERÍAS', 'no', 476);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46634', 'VENTA AL POR MAYOR DE MADERAS', 'no', 477);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46639', 'VENTA AL POR MAYOR DE MATERIALES PARA LA CONSTRUCCIÓN N.C.P.', 'no', 478);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46691', 'VENTA AL POR MAYOR DE SAL INDUSTRIAL SIN YODAR', 'no', 479);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46692', 'VENTA AL POR MAYOR DE PRODUCTOS INTERMEDIOS Y DESECHOS DE ORIGEN TEXTIL', 'no', 480);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46693', 'VENTA AL POR MAYOR DE PRODUCTOS INTERMEDIOS Y DESECHOS DE ORIGEN METÁLICO', 'no', 481);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46694', 'VENTA AL POR MAYOR DE PRODUCTOS INTERMEDIOS Y DESECHOS DE PAPEL Y CARTÓN', 'no', 482);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46695', 'VENTA AL POR MAYOR FERTILIZANTES, ABONOS, AGROQUÍMICOS Y PRODUCTOS SIMILARES', 'no', 484);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46696', 'VENTA AL POR MAYOR DE PRODUCTOS INTERMEDIOS Y DESECHOS DE ORIGEN PLÁSTICO', 'no', 485);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46697', 'VENTA AL POR MAYOR DE TINTAS PARA IMPRENTA, PRODUCTOS CURTIENTES Y MATERIAS Y PRODUCTOS COLORANTES', 'no', 486);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46698', 'VENTA DE PRODUCTOS INTERMEDIOS Y DESECHOS DE ORIGEN QUÍMICO Y DE CAUCHO', 'no', 487);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46699', 'VENTA AL POR MAYOR DE PRODUCTOS INTERMEDIOS Y DESECHOS NCP', 'no', 488);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46701', 'VENTA DE ALGODÓN EN ORO', 'no', 489);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46900', 'VENTA AL POR MAYOR DE OTROS PRODUCTOS', 'no', 490);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46901', 'VENTA AL POR MAYOR DE COHETES Y OTROS PRODUCTOS PIROTÉCNICOS', 'no', 491);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46902', 'VENTA AL POR MAYOR DE ARTÍCULOS DIVERSOS PARA CONSUMO HUMANO', 'no', 492);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46903', 'VENTA AL POR MAYOR DE ARMAS DE FUEGO, MUNICIONES Y ACCESORIOS', 'no', 493);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46904', 'VENTA AL POR MAYOR DE TOLDOS Y TIENDAS DE CAMPAÑA DE CUALQUIER MATERIAL', 'no', 494);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46905', 'VENTA AL POR MAYOR DE EXHIBIDORES PUBLICITARIOS Y RÓTULOS', 'no', 495);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('46906', 'VENTA AL POR MAYOR DE ARTÍCULOS PROMOCIONALES DIVERSOS', 'no', 496);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47111', 'VENTA EN SUPERMERCADOS', 'no', 498);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47112', 'VENTA EN TIENDAS DE ARTÍCULOS DE PRIMERA NECESIDAD', 'no', 499);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47119', 'ALMACENES (VENTA DE DIVERSOS ARTÍCULOS)', 'no', 500);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47190', 'VENTA AL POR MENOR DE OTROS PRODUCTOS EN COMERCIOS NO ESPECIALIZADOS', 'no', 501);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47199', 'VENTA DE ESTABLECIMIENTOS NO ESPECIALIZADOS CON SURTIDO COMPUESTO PRINCIPALMENTE DE ALIMENTOS, BEBIDAS Y TABACO', 'no', 502);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47211', 'VENTA AL POR MENOR DE FRUTAS Y HORTALIZAS', 'no', 503);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47212', 'VENTA AL POR MENOR DE CARNES, EMBUTIDOS Y PRODUCTOS DE GRANJA', 'no', 504);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47213', 'VENTA AL POR MENOR DE PESCADO Y MARISCOS', 'no', 505);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47214', 'VENTA AL POR MENOR DE PRODUCTOS LÁCTEOS', 'no', 506);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47215', 'VENTA AL POR MENOR DE PRODUCTOS DE PANADERÍA, REPOSTERÍA Y GALLETAS', 'no', 507);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47216', 'VENTA AL POR MENOR DE HUEVOS', 'no', 508);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47217', 'VENTA AL POR MENOR DE CARNES Y PRODUCTOS CÁRNICOS', 'no', 509);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47218', 'VENTA AL POR MENOR DE GRANOS BÁSICOS Y OTROS', 'no', 510);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47219', 'VENTA AL POR MENOR DE ALIMENTOS N.C.P.', 'no', 511);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47221', 'VENTA AL POR MENOR DE HIELO', 'no', 512);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47223', 'VENTA DE BEBIDAS NO ALCOHÓLICAS, PARA SU CONSUMO FUERA DEL ESTABLECIMIENTO', 'no', 513);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47224', 'VENTA DE BEBIDAS ALCOHÓLICAS, PARA SU CONSUMO FUERA DEL ESTABLECIMIENTO', 'no', 514);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47225', 'VENTA DE BEBIDAS ALCOHÓLICAS PARA SU CONSUMO DENTRO DEL ESTABLECIMIENTO', 'no', 515);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47230', 'VENTA AL POR MENOR DE TABACO', 'no', 516);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47300', 'VENTA DE COMBUSTIBLES, LUBRICANTES Y OTROS (GASOLINERAS)', 'no', 517);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47411', 'VENTA AL POR MENOR DE COMPUTADORAS Y EQUIPO PERIFÉRICO', 'no', 518);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47412', 'VENTA DE EQUIPO Y ACCESORIOS DE TELECOMUNICACIÓN', 'no', 519);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47420', 'VENTA AL POR MENOR DE EQUIPO DE AUDIO Y VIDEO', 'no', 520);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47510', 'VENTA AL POR MENOR DE HILADOS, TEJIDOS Y PRODUCTOS TEXTILES DE MERCERÍA; CONFECCIONES PARA EL HOGAR Y TEXTILES N.C.P.', 'no', 521);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47521', 'VENTA AL POR MENOR DE PRODUCTOS DE MADERA', 'no', 522);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47522', 'VENTA AL POR MENOR DE ARTÍCULOS DE FERRETERÍA', 'no', 523);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47523', 'VENTA AL POR MENOR DE PRODUCTOS DE PINTURERÍAS', 'no', 524);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47524', 'VENTA AL POR MENOR EN VIDRIERÍAS', 'no', 525);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47529', 'VENTA AL POR MENOR DE MATERIALES DE CONSTRUCCIÓN Y ARTÍCULOS CONEXOS', 'no', 526);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47530', 'VENTA AL POR MENOR DE TAPICES, ALFOMBRAS Y REVESTIMIENTOS DE PAREDES Y PISOS EN COMERCIOS ESPECIALIZADOS', 'no', 527);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47591', 'VENTA AL POR MENOR DE MUEBLES', 'no', 528);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47592', 'VENTA AL POR MENOR DE ARTÍCULOS DE BAZAR', 'no', 529);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47593', 'VENTA AL POR MENOR DE APARATOS ELECTRODOMÉSTICOS, REPUESTOS Y ACCESORIOS', 'no', 530);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47594', 'VENTA AL POR MENOR DE ARTÍCULOS ELÉCTRICOS Y DE ILUMINACIÓN', 'no', 531);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47598', 'VENTA AL POR MENOR DE INSTRUMENTOS MUSICALES', 'no', 532);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47610', 'VENTA AL POR MENOR DE LIBROS, PERIÓDICOS Y ARTÍCULOS DE PAPELERÍA EN COMERCIOS ESPECIALIZADOS', 'no', 533);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47620', 'VENTA AL POR MENOR DE DISCOS LÁSER, CASSETTES, CINTAS DE VIDEO Y OTROS', 'no', 534);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47630', 'VENTA AL POR MENOR DE PRODUCTOS Y EQUIPOS DE DEPORTE', 'no', 535);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47631', 'VENTA AL POR MENOR DE BICICLETAS, ACCESORIOS Y REPUESTOS', 'no', 536);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47640', 'VENTA AL POR MENOR DE JUEGOS Y JUGUETES EN COMERCIOS ESPECIALIZADOS', 'no', 537);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47711', 'VENTA AL POR MENOR DE PRENDAS DE VESTIR Y ACCESORIOS DE VESTIR', 'no', 538);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47712', 'VENTA AL POR MENOR DE CALZADO', 'no', 539);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47713', 'VENTA AL POR MENOR DE ARTÍCULOS DE PELETERÍA, MARROQUINERÍA Y TALABARTERÍA', 'no', 540);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47721', 'VENTA AL POR MENOR DE MEDICAMENTOS FARMACÉUTICOS Y OTROS MATERIALES Y ARTÍCULOS DE USO MÉDICO, ODONTOLÓGICO Y VETERINARIO', 'no', 541);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47722', 'VENTA AL POR MENOR DE PRODUCTOS COSMÉTICOS Y DE TOCADOR', 'no', 542);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47731', 'VENTA AL POR MENOR DE PRODUCTOS DE JOYERÍA, BISUTERÍA, ÓPTICA, RELOJERÍA', 'no', 543);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47732', 'VENTA AL POR MENOR DE PLANTAS, SEMILLAS, ANIMALES Y ARTÍCULOS CONEXOS', 'no', 544);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47733', 'VENTA AL POR MENOR DE COMBUSTIBLES DE USO DOMÉSTICO (GAS PROPANO Y GAS LICUADO)', 'no', 545);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47734', 'VENTA AL POR MENOR DE ARTESANÍAS, ARTÍCULOS CERÁMICOS Y RECUERDOS EN GENERAL', 'no', 546);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47735', 'VENTA AL POR MENOR DE ATAÚDES, LÁPIDAS Y CRUCES, TROFEOS, ARTÍCULOS RELIGIOSOS EN GENERAL', 'no', 547);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47736', 'VENTA AL POR MENOR DE ARMAS DE FUEGO, MUNICIONES Y ACCESORIOS', 'no', 548);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47737', 'VENTA AL POR MENOR DE ARTÍCULOS DE COHETERÍA Y PIROTÉCNICOS', 'no', 549);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47738', 'VENTA AL POR MENOR DE ARTÍCULOS DESECHABLES DE USO PERSONAL Y DOMÉSTICO (SERVILLETAS, PAPEL HIGIÉNICO, PAÑALES, TOALLAS SANITARIAS, ETC.)', 'no', 550);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47739', 'VENTA AL POR MENOR DE OTROS PRODUCTOS N.C.P.', 'no', 551);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47741', 'VENTA AL POR MENOR DE ARTÍCULOS USADOS', 'no', 552);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47742', 'VENTA AL POR MENOR DE TEXTILES Y CONFECCIONES USADOS', 'no', 553);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47743', 'VENTA AL POR MENOR DE LIBROS, REVISTAS, PAPEL Y CARTÓN USADOS', 'no', 554);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47749', 'VENTA AL POR MENOR DE PRODUCTOS USADOS N.C.P.', 'no', 555);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47811', 'VENTA AL POR MENOR DE FRUTAS, VERDURAS Y HORTALIZAS', 'no', 556);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47814', 'VENTA AL POR MENOR DE PRODUCTOS LÁCTEOS', 'no', 557);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47815', 'VENTA AL POR MENOR DE PRODUCTOS DE PANADERÍA, GALLETAS Y SIMILARES', 'no', 558);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47816', 'VENTA AL POR MENOR DE BEBIDAS', 'no', 559);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47818', 'VENTA AL POR MENOR EN TIENDAS DE MERCADO Y PUESTOS', 'no', 560);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47821', 'VENTA AL POR MENOR DE HILADOS, TEJIDOS Y PRODUCTOS TEXTILES DE MERCERÍA EN PUESTOS DE MERCADOS Y FERIAS', 'no', 561);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47822', 'VENTA AL POR MENOR DE ARTÍCULOS TEXTILES EXCEPTO CONFECCIONES PARA EL HOGAR EN PUESTOS DE MERCADOS Y FERIAS', 'no', 562);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47823', 'VENTA AL POR MENOR DE CONFECCIONES TEXTILES PARA EL HOGAR EN PUESTOS DE MERCADOS Y FERIAS', 'no', 563);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47824', 'VENTA AL POR MENOR DE PRENDAS DE VESTIR, ACCESORIOS DE VESTIR Y SIMILARES EN PUESTOS DE MERCADOS Y FERIAS', 'no', 564);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47825', 'VENTA AL POR MENOR DE ROPA USADA', 'no', 565);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47826', 'VENTA AL POR MENOR DE CALZADO, ARTÍCULOS DE MARROQUINERÍA Y TALABARTERÍA EN PUESTOS DE MERCADOS Y FERIAS', 'no', 566);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47827', 'VENTA AL POR MENOR DE ARTÍCULOS DE MARROQUINERÍA Y TALABARTERÍA EN PUESTOS DE MERCADOS Y FERIAS', 'no', 567);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47829', 'VENTA AL POR MENOR DE ARTÍCULOS TEXTILES NCP EN PUESTOS DE MERCADOS Y FERIAS', 'no', 568);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47891', 'VENTA AL POR MENOR DE ANIMALES, FLORES Y PRODUCTOS CONEXOS EN PUESTOS DE FERIA Y MERCADOS', 'no', 569);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47892', 'VENTA AL POR MENOR DE PRODUCTOS MEDICINALES, COSMÉTICOS, DE TOCADOR Y DE LIMPIEZA EN PUESTOS DE FERIAS Y MERCADOS', 'no', 570);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47893', 'VENTA AL POR MENOR DE ARTÍCULOS DE BAZAR EN PUESTOS DE FERIAS Y MERCADOS', 'no', 571);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47894', 'VENTA AL POR MENOR DE ARTÍCULOS DE PAPEL, ENVASES, LIBROS, REVISTAS Y CONEXOS EN PUESTOS DE FERIA Y MERCADOS', 'no', 572);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47895', 'VENTA AL POR MENOR DE MATERIALES DE CONSTRUCCIÓN, ELECTRODOMÉSTICOS, ACCESORIOS PARA AUTOS Y SIMILARES EN PUESTOS DE FERIA Y MERCADOS', 'no', 573);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47896', 'VENTA AL POR MENOR DE EQUIPOS ACCESORIOS PARA LAS COMUNICACIONES EN PUESTOS DE FERIA Y MERCADOS', 'no', 574);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47899', 'VENTA AL POR MENOR EN PUESTOS DE FERIAS Y MERCADOS N.C.P.', 'no', 575);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47910', 'VENTA AL POR MENOR POR CORREO O INTERNET', 'no', 576);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('47990', 'OTROS TIPOS DE VENTA AL POR MENOR NO REALIZADA, EN ALMACENES, PUESTOS DE VENTA O MERCADO', 'no', 577);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49110', 'TRANSPORTE INTERURBANO DE PASAJEROS POR FERROCARRIL', 'no', 580);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49120', 'TRANSPORTE DE CARGA POR FERROCARRIL', 'no', 581);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49211', 'TRANSPORTE DE PASAJEROS URBANOS E INTERURBANO MEDIANTE BUSES', 'no', 582);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49212', 'TRANSPORTE DE PASAJEROS INTERDEPARTAMENTAL MEDIANTE MICROBUSES', 'no', 583);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49213', 'TRANSPORTE DE PASAJEROS URBANOS E INTERURBANO MEDIANTE MICROBUSES', 'no', 584);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49214', 'TRANSPORTE DE PASAJEROS INTERDEPARTAMENTAL MEDIANTE BUSES', 'no', 585);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49221', 'TRANSPORTE INTERNACIONAL DE PASAJEROS', 'no', 586);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49222', 'TRANSPORTE DE PASAJEROS MEDIANTE TAXIS Y AUTOS CON CHOFER', 'no', 587);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49223', 'TRANSPORTE ESCOLAR', 'no', 588);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49225', 'TRANSPORTE DE PASAJEROS PARA EXCURSIONES', 'no', 589);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49226', 'SERVICIOS DE TRANSPORTE DE PERSONAL', 'no', 590);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49229', 'TRANSPORTE DE PASAJEROS POR VÍA TERRESTRE NCP', 'no', 591);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49231', 'TRANSPORTE DE CARGA URBANO', 'no', 592);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49232', 'TRANSPORTE NACIONAL DE CARGA', 'no', 593);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49233', 'TRANSPORTE DE CARGA INTERNACIONAL', 'no', 594);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49234', 'SERVICIOS DE MUDANZA', 'no', 595);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49235', 'ALQUILER DE VEHÍCULOS DE CARGA CON CONDUCTOR', 'no', 596);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('49300', 'TRANSPORTE POR OLEODUCTO O GASODUCTO', 'no', 597);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('50110', 'TRANSPORTE DE PASAJEROS MARÍTIMO Y DE CABOTAJE', 'no', 599);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('50120', 'TRANSPORTE DE CARGA MARÍTIMO Y DE CABOTAJE', 'no', 600);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('50211', 'TRANSPORTE DE PASAJEROS POR VÍAS DE NAVEGACIÓN INTERIORES', 'no', 601);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('50212', 'ALQUILER DE EQUIPO DE TRANSPORTE DE PASAJEROS POR VÍAS DE NAVEGACIÓN INTERIOR CON CONDUCTOR', 'no', 602);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('50220', 'TRANSPORTE DE CARGA POR VÍAS DE NAVEGACIÓN INTERIORES', 'no', 603);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('51100', 'TRANSPORTE AÉREO DE PASAJEROS', 'no', 605);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('51201', 'TRANSPORTE DE CARGA POR VÍA AÉREA', 'no', 606);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('51202', 'ALQUILER DE EQUIPO DE AEROTRANSPORTE CON OPERADORES PARA EL PROPÓSITO DE TRANSPORTAR CARGA', 'no', 607);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52101', 'ALQUILER DE INSTALACIONES DE ALMACENAMIENTO EN ZONAS FRANCAS', 'no', 609);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52102', 'ALQUILER DE SILOS PARA CONSERVACIÓN Y ALMACENAMIENTO DE GRANOS', 'no', 610);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52103', 'ALQUILER DE INSTALACIONES CON REFRIGERACIÓN PARA ALMACENAMIENTO Y CONSERVACIÓN DE ALIMENTOS Y OTROS PRODUCTOS', 'no', 611);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52109', 'ALQUILER DE BODEGAS PARA ALMACENAMIENTO Y DEPÓSITO N.C.P.', 'no', 612);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52211', 'SERVICIO DE GARAJE Y ESTACIONAMIENTO', 'no', 613);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52212', 'SERVICIOS DE TERMINALES PARA EL TRANSPORTE POR VÍA TERRESTRE', 'no', 614);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52219', 'SERVICIOS PARA EL TRANSPORTE POR VÍA TERRESTRE N.C.P.', 'no', 615);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52220', 'SERVICIOS PARA EL TRANSPORTE ACUÁTICO', 'no', 616);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52230', 'SERVICIOS PARA EL TRANSPORTE AÉREO', 'no', 617);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52240', 'MANIPULACIÓN DE CARGA', 'no', 618);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52290', 'SERVICIOS PARA EL TRANSPORTE NCP', 'no', 619);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('52291', 'AGENCIAS DE TRAMITACIONES ADUANALES', 'no', 620);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('53100', 'SERVICIOS DE CORREO NACIONAL', 'no', 622);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('53200', 'ACTIVIDADES DE CORREO DISTINTAS A LAS ACTIVIDADES POSTALES NACIONALES', 'no', 623);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('53201', 'AGENCIA PRIVADA DE CORREO Y ENCOMIENDAS', 'no', 623);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('55101', 'ACTIVIDADES DE ALOJAMIENTO PARA ESTANCIAS CORTAS', 'no', 626);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('55102', 'HOTELES', 'no', 627);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('55200', 'ACTIVIDADES DE CAMPAMENTOS, PARQUES DE VEHÍCULOS DE RECREO Y PARQUES DE CARAVANAS', 'no', 628);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('55900', 'ALOJAMIENTO N.C.P.', 'no', 629);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56101', 'RESTAURANTES', 'no', 631);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56106', 'PUPUSERÍA', 'no', 632);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56107', 'ACTIVIDADES VARIAS DE RESTAURANTES', 'no', 633);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56108', 'COMEDORES', 'no', 634);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56109', 'MERENDEROS AMBULANTES', 'no', 635);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56210', 'PREPARACIÓN DE COMIDA PARA EVENTOS ESPECIALES', 'no', 636);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56291', 'SERVICIOS DE PROVISIÓN DE COMIDAS POR CONTRATO', 'no', 637);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56292', 'SERVICIOS DE CONCESIÓN DE CAFETINES Y CHALET EN EMPRESAS E INSTITUCIONES', 'no', 638);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56299', 'SERVICIOS DE PREPARACIÓN DE COMIDAS NCP', 'no', 639);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56301', 'SERVICIO DE EXPENDIO DE BEBIDAS EN SALONES Y BARES', 'no', 640);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('56302', 'SERVICIO DE EXPENDIO DE BEBIDAS EN PUESTOS CALLEJEROS, MERCADOS Y FERIAS', 'no', 641);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('58110', 'EDICIÓN DE LIBROS, FOLLETOS, PARTITURAS Y OTRAS EDICIONES DISTINTAS A ESTAS', 'no', 644);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('58120', 'EDICIÓN DE DIRECTORIOS Y LISTAS DE CORREOS', 'no', 645);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('58130', 'EDICIÓN DE PERIÓDICOS, REVISTAS Y OTRAS PUBLICACIONES PERIÓDICAS', 'no', 646);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('58190', 'OTRAS ACTIVIDADES DE EDICIÓN', 'no', 647);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('58200', 'EDICIÓN DE PROGRAMAS INFORMÁTICOS (SOFTWARE)', 'no', 648);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('59110', 'ACTIVIDADES DE PRODUCCIÓN CINEMATOGRÁFICA', 'no', 650);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('59120', 'ACTIVIDADES DE POST PRODUCCIÓN DE PELÍCULAS, VIDEOS Y PROGRAMAS DE TELEVISIÓN', 'no', 651);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('59130', 'ACTIVIDADES DE DISTRIBUCIÓN DE PELÍCULAS CINEMATOGRÁFICAS, VIDEOS Y PROGRAMAS DE TELEVISIÓN', 'no', 652);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('59140', 'ACTIVIDADES DE EXHIBICIÓN DE PELÍCULAS CINEMATOGRÁFICAS Y CINTAS DE VÍDEO', 'no', 653);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('59200', 'ACTIVIDADES DE EDICIÓN Y GRABACIÓN DE MÚSICA', 'no', 654);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('60100', 'SERVICIOS DE DIFUSIONES DE RADIO', 'no', 656);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('60201', 'ACTIVIDADES DE PROGRAMACIÓN Y DIFUSIÓN DE TELEVISIÓN ABIERTA', 'no', 657);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('60202', 'ACTIVIDADES DE SUSCRIPCIÓN Y DIFUSIÓN DE TELEVISIÓN POR CABLE Y/O SUSCRIPCIÓN', 'no', 658);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('60299', 'SERVICIOS DE TELEVISIÓN, INCLUYE TELEVISIÓN POR CABLE', 'no', 659);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('60900', 'PROGRAMACIÓN Y TRANSMISIÓN DE RADIO Y TELEVISIÓN', 'no', 660);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61101', 'SERVICIO DE TELEFONÍA', 'no', 662);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61102', 'SERVICIO DE INTERNET', 'no', 663);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61103', 'SERVICIO DE TELEFONÍA FIJA', 'no', 664);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61109', 'SERVICIO DE INTERNET N.C.P.', 'no', 665);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61201', 'SERVICIOS DE TELEFONÍA CELULAR', 'no', 666);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61202', 'SERVICIOS DE INTERNET INALÁMBRICO', 'no', 667);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61209', 'SERVICIOS DE TELECOMUNICACIONES INALÁMBRICO N.C.P.', 'no', 668);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61301', 'TELECOMUNICACIONES SATELITALES', 'no', 669);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61309', 'COMUNICACIÓN VÍA SATÉLITE N.C.P.', 'no', 670);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('61900', 'ACTIVIDADES DE TELECOMUNICACIÓN N.C.P.', 'no', 671);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('62010', 'PROGRAMACIÓN INFORMÁTICA', 'no', 673);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('62020', 'CONSULTORÍAS Y GESTIÓN DE SERVICIOS INFORMÁTICOS', 'no', 674);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('62090', 'OTRAS ACTIVIDADES DE TECNOLOGÍA DE INFORMACIÓN Y SERVICIOS DE COMPUTADORA', 'no', 675);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('63110', 'PROCESAMIENTO DE DATOS Y ACTIVIDADES RELACIONADAS', 'no', 677);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('63120', 'PORTALES WEB', 'no', 678);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('63910', 'SERVICIOS DE AGENCIAS DE NOTICIAS', 'no', 679);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('63990', 'OTROS SERVICIOS DE INFORMACIÓN N.C.P.', 'no', 680);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64110', 'SERVICIOS PROVISTOS POR EL BANCO CENTRAL DE EL SALVADOR', 'no', 683);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64190', 'BANCOS', 'no', 684);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64192', 'ENTIDADES DEDICADAS AL ENVÍO DE REMESAS', 'no', 685);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64199', 'OTRAS ENTIDADES FINANCIERAS', 'no', 686);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64200', 'ACTIVIDADES DE SOCIEDADES DE CARTERA', 'no', 687);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64300', 'FIDEICOMISOS, FONDOS Y OTRAS FUENTES DE FINANCIAMIENTO', 'no', 688);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64910', 'ARRENDAMIENTOS FINANCIEROS', 'no', 689);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64920', 'ASOCIACIONES COOPERATIVAS DE AHORRO Y CRÉDITO DEDICADAS A LA INTERMEDIACIÓN FINANCIERA', 'no', 690);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64921', 'INSTITUCIONES EMISORAS DE TARJETAS DE CRÉDITO Y OTROS', 'no', 691);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64922', 'TIPOS DE CRÉDITO NCP', 'no', 692);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64928', 'PRESTAMISTAS Y CASAS DE EMPEÑO', 'no', 693);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('64990', 'ACTIVIDADES DE SERVICIOS FINANCIEROS, EXCEPTO LA FINANCIACIÓN DE PLANES DE SEGUROS Y DE PENSIONES N.C.P.', 'no', 694);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('65110', 'PLANES DE SEGUROS DE VIDA', 'no', 696);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('65120', 'PLANES DE SEGURO EXCEPTO DE VIDA', 'no', 697);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('65199', 'SEGUROS GENERALES DE TODO TIPO', 'no', 698);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('65200', 'PLANES SE SEGURO', 'no', 699);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('65300', 'PLANES DE PENSIONES', 'no', 700);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('66110', 'ADMINISTRACIÓN DE MERCADOS FINANCIEROS (BOLSA DE VALORES)', 'no', 702);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('66120', 'ACTIVIDADES BURSÁTILES (CORREDORES DE BOLSA)', 'no', 703);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('66190', 'ACTIVIDADES AUXILIARES DE LA INTERMEDIACIÓN FINANCIERA NCP', 'no', 704);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('66210', 'EVALUACIÓN DE RIESGOS Y DAÑOS', 'no', 705);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('66220', 'ACTIVIDADES DE AGENTES Y CORREDORES DE SEGUROS', 'no', 706);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('66290', 'OTRAS ACTIVIDADES AUXILIARES DE SEGUROS Y FONDOS DE PENSIONES', 'no', 707);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('66300', 'ACTIVIDADES DE ADMINISTRACIÓN DE FONDOS', 'no', 708);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('68101', 'SERVICIO DE ALQUILER Y VENTA DE LOTES EN CEMENTERIOS', 'no', 710);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('68109', 'ACTIVIDADES INMOBILIARIAS REALIZADAS CON BIENES PROPIOS O ARRENDADOS N.C.P.', 'no', 711);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('68200', 'ACTIVIDADES INMOBILIARIAS REALIZADAS A CAMBIO DE UNA RETRIBUCIÓN O POR CONTRATA', 'no', 712);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('69100', 'ACTIVIDADES JURÍDICAS', 'no', 715);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('69200', 'ACTIVIDADES DE CONTABILIDAD, TENEDURÍA DE LIBROS Y AUDITORÍA; ASESORAMIENTO EN MATERIA DE IMPUESTOS', 'no', 716);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('70100', 'ACTIVIDADES DE OFICINAS CENTRALES DE SOCIEDADES DE CARTERA', 'no', 718);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('70200', 'ACTIVIDADES DE CONSULTORÍA EN GESTIÓN EMPRESARIAL', 'no', 719);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('71101', 'SERVICIOS DE ARQUITECTURA Y PLANIFICACIÓN URBANA Y SERVICIOS CONEXOS', 'no', 721);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('71102', 'SERVICIOS DE INGENIERÍA', 'no', 722);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('71103', 'SERVICIOS DE AGRIMENSURA, TOPOGRAFÍA, CARTOGRAFÍA, PROSPECCIÓN Y GEOFÍSICA Y SERVICIOS CONEXOS', 'no', 723);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('71200', 'ENSAYOS Y ANÁLISIS TÉCNICOS', 'no', 724);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('72100', 'INVESTIGACIONES Y DESARROLLO EXPERIMENTAL EN EL CAMPO DE LAS CIENCIAS NATURALES Y LA INGENIERÍA', 'no', 726);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('72199', 'INVESTIGACIONES CIENTÍFICAS', 'no', 727);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('72200', 'INVESTIGACIONES Y DESARROLLO EXPERIMENTAL EN EL CAMPO DE LAS CIENCIAS SOCIALES Y LAS HUMANIDADES CIENTÍFICA Y DESARROLLO', 'no', 728);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('73100', 'PUBLICIDAD', 'no', 730);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('73200', 'INVESTIGACIÓN DE MERCADOS Y REALIZACIÓN DE ENCUESTAS DE OPINIÓN PÚBLICA', 'no', 731);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('74100', 'ACTIVIDADES DE DISEÑO ESPECIALIZADO', 'no', 733);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('74200', 'ACTIVIDADES DE FOTOGRAFÍA', 'no', 734);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('74900', 'SERVICIOS PROFESIONALES Y CIENTÍFICOS NCP', 'no', 735);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('75000', 'ACTIVIDADES VETERINARIAS', 'no', 737);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('77101', 'ALQUILER DE EQUIPO DE TRANSPORTE TERRESTRE', 'no', 740);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('77102', 'ALQUILER DE EQUIPO DE TRANSPORTE ACUÁTICO', 'no', 741);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('77103', 'ALQUILER DE EQUIPO DE TRANSPORTE POR VÍA AÉREA', 'no', 742);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('77210', 'ALQUILER Y ARRENDAMIENTO DE EQUIPO DE RECREO Y DEPORTIVO', 'no', 743);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('77220', 'ALQUILER DE CINTAS DE VIDEO Y DISCOS', 'no', 744);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('77290', 'ALQUILER DE OTROS EFECTOS PERSONALES Y ENSERES DOMÉSTICOS', 'no', 745);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('77300', 'ALQUILER DE MAQUINARIA Y EQUIPO', 'no', 746);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('77400', 'ARRENDAMIENTO DE PRODUCTOS DE PROPIEDAD INTELECTUAL', 'no', 747);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('78100', 'OBTENCIÓN Y DOTACIÓN DE PERSONAL', 'no', 749);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('78200', 'ACTIVIDADES DE LAS AGENCIAS DE TRABAJO TEMPORAL', 'no', 750);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('78300', 'DOTACIÓN DE RECURSOS HUMANOS Y GESTIÓN; GESTIÓN DE LAS FUNCIONES DE RECURSOS HUMANOS', 'no', 751);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('79110', 'ACTIVIDADES DE AGENCIAS DE VIAJES Y ORGANIZADORES DE VIAJES; ACTIVIDADES DE ASISTENCIA A TURISTAS', 'no', 753);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('79120', 'ACTIVIDADES DE LOS OPERADORES TURÍSTICOS', 'no', 754);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('79900', 'OTROS SERVICIOS DE RESERVAS Y ACTIVIDADES RELACIONADAS', 'no', 755);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('80100', 'SERVICIOS DE SEGURIDAD PRIVADOS', 'no', 757);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('80201', 'ACTIVIDADES DE SERVICIOS DE SISTEMAS DE SEGURIDAD', 'no', 758);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('80202', 'ACTIVIDADES PARA LA PRESTACIÓN DE SISTEMAS DE SEGURIDAD', 'no', 759);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('80300', 'ACTIVIDADES DE INVESTIGACIÓN', 'no', 760);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('81100', 'ACTIVIDADES COMBINADAS DE MANTENIMIENTO DE EDIFICIOS E INSTALACIONES', 'no', 762);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('81210', 'LIMPIEZA GENERAL DE EDIFICIOS', 'no', 763);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('81290', 'OTRAS ACTIVIDADES COMBINADAS DE MANTENIMIENTO DE EDIFICIOS E INSTALACIONES NCP', 'no', 764);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('81300', 'SERVICIO DE JARDINERÍA', 'no', 765);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('82110', 'SERVICIOS ADMINISTRATIVOS DE OFICINAS', 'no', 767);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('82190', 'SERVICIO DE FOTOCOPIADO Y SIMILARES, EXCEPTO EN IMPRENTAS', 'no', 768);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('82200', 'ACTIVIDADES DE LAS CENTRALES DE LLAMADAS (CALL CENTER)', 'no', 769);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('82300', 'ORGANIZACIÓN DE CONVENCIONES Y FERIAS DE NEGOCIOS', 'no', 770);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('82910', 'ACTIVIDADES DE AGENCIAS DE COBRO Y OFICINAS DE CRÉDITO', 'no', 771);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('82921', 'SERVICIOS DE ENVASE Y EMPAQUE DE PRODUCTOS ALIMENTICIOS', 'no', 772);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('82922', 'SERVICIOS DE ENVASE Y EMPAQUE DE PRODUCTOS MEDICINALES', 'no', 773);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('82929', 'SERVICIO DE ENVASE Y EMPAQUE NCP', 'no', 774);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('82990', 'ACTIVIDADES DE APOYO EMPRESARIALES NCP', 'no', 775);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('84110', 'ACTIVIDADES DE LA ADMINISTRACIÓN PÚBLICA EN GENERAL', 'no', 777);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('84111', 'ALCALDÍAS MUNICIPALES', 'no', 778);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('84120', 'REGULACIÓN DE LAS ACTIVIDADES DE PRESTACIÓN DE SERVICIOS SANITARIOS, EDUCATIVOS, CULTURALES Y OTROS SERVICIOS SOCIALES, EXCEPTO SEGURIDAD SOCIAL', 'no', 779);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('84130', 'REGULACIÓN Y FACILITACIÓN DE LA ACTIVIDAD ECONÓMICA', 'no', 780);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('84210', 'ACTIVIDADES DE ADMINISTRACIÓN Y FUNCIONAMIENTO DEL MINISTERIO DE RELACIONES EXTERIORES', 'no', 781);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('84220', 'ACTIVIDADES DE DEFENSA', 'no', 782);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('84230', 'ACTIVIDADES DE MANTENIMIENTO DEL ORDEN PÚBLICO Y DE SEGURIDAD', 'no', 783);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('84300', 'ACTIVIDADES DE PLANES DE SEGURIDAD SOCIAL DE AFILIACIÓN OBLIGATORIA', 'no', 784);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85101', 'GUARDERÍA EDUCATIVA', 'no', 786);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85102', 'ENSEÑANZA PREESCOLAR O PARVULARIA', 'no', 787);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85103', 'ENSEÑANZA PRIMARIA', 'no', 788);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85104', 'SERVICIO DE EDUCACIÓN PREESCOLAR Y PRIMARIA INTEGRADA', 'no', 789);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85211', 'ENSEÑANZA SECUNDARIA TERCER CICLO (7°, 8° Y 9°)', 'no', 790);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85212', 'ENSEÑANZA SECUNDARIA DE FORMACIÓN GENERAL BACHILLERATO', 'no', 791);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85221', 'ENSEÑANZA SECUNDARIA DE FORMACIÓN TÉCNICA Y PROFESIONAL', 'no', 792);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85222', 'ENSEÑANZA SECUNDARIA DE FORMACIÓN TÉCNICA Y PROFESIONAL INTEGRADA CON ENSEÑANZA PRIMARIA', 'no', 793);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85301', 'ENSEÑANZA SUPERIOR UNIVERSITARIA', 'no', 794);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85302', 'ENSEÑANZA SUPERIOR NO UNIVERSITARIA', 'no', 795);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85303', 'ENSEÑANZA SUPERIOR INTEGRADA A EDUCACIÓN SECUNDARIA Y/O PRIMARIA', 'no', 796);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85410', 'EDUCACIÓN DEPORTIVA Y RECREATIVA', 'no', 797);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85420', 'EDUCACIÓN CULTURAL', 'no', 798);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85490', 'OTROS TIPOS DE ENSEÑANZA N.C.P.', 'no', 799);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85499', 'ENSEÑANZA FORMAL', 'no', 800);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('85500', 'SERVICIOS DE APOYO A LA ENSEÑANZA', 'no', 801);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('86100', 'ACTIVIDADES DE HOSPITALES', 'no', 804);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('86201', 'CLÍNICAS MÉDICAS', 'no', 805);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('86202', 'SERVICIOS DE ODONTOLOGÍA', 'no', 806);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('86203', 'SERVICIOS MÉDICOS', 'no', 807);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('86901', 'SERVICIOS DE ANÁLISIS Y ESTUDIOS DE DIAGNÓSTICO', 'no', 808);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('86902', 'ACTIVIDADES DE ATENCIÓN DE LA SALUD HUMANA', 'no', 809);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('86909', 'OTROS SERVICIO RELACIONADOS CON LA SALUD NCP', 'no', 810);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('87100', 'RESIDENCIAS DE ANCIANOS CON ATENCIÓN DE ENFERMERÍA', 'no', 812);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('87200', 'INSTITUCIONES DEDICADAS AL TRATAMIENTO DEL RETRASO MENTAL, PROBLEMAS DE SALUD MENTAL Y EL USO INDEBIDO DE SUSTANCIAS NOCIVAS', 'no', 813);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('87300', 'INSTITUCIONES DEDICADAS AL CUIDADO DE ANCIANOS Y DISCAPACITADOS', 'no', 814);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('87900', 'ACTIVIDADES DE ASISTENCIA A NIÑOS Y JÓVENES', 'no', 815);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('87901', 'OTRAS ACTIVIDADES DE ATENCIÓN EN INSTITUCIONES', 'no', 816);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('88100', 'ACTIVIDADES DE ASISTENCIA SOCIALES SIN ALOJAMIENTO PARA ANCIANOS Y DISCAPACITADOS', 'no', 818);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('88900', 'SERVICIOS SOCIALES SIN ALOJAMIENTO NCP', 'no', 819);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('90000', 'ACTIVIDADES CREATIVAS ARTÍSTICAS Y DE ESPARCIMIENTO', 'no', 822);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('91010', 'ACTIVIDADES DE BIBLIOTECAS Y ARCHIVOS', 'no', 824);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('91020', 'ACTIVIDADES DE MUSEOS Y PRESERVACIÓN DE LUGARES Y EDIFICIOS HISTÓRICOS', 'no', 825);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('91030', 'ACTIVIDADES DE JARDINES BOTÁNICOS, ZOOLÓGICOS Y DE RESERVAS NATURALES', 'no', 826);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('92000', 'ACTIVIDADES DE JUEGOS Y APUESTAS', 'no', 828);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('93110', 'GESTIÓN DE INSTALACIONES DEPORTIVAS', 'no', 830);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('93120', 'ACTIVIDADES DE CLUBES DEPORTIVOS', 'no', 831);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('93190', 'OTRAS ACTIVIDADES DEPORTIVAS', 'no', 832);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('93210', 'ACTIVIDADES DE PARQUES DE ATRACCIONES Y PARQUES TEMÁTICOS', 'no', 833);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('93291', 'DISCOTECAS Y SALAS DE BAILE', 'no', 834);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('93298', 'CENTROS VACACIONALES', 'no', 835);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('93299', 'ACTIVIDADES DE ESPARCIMIENTO NCP', 'no', 836);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('94110', 'ACTIVIDADES DE ORGANIZACIONES EMPRESARIALES Y DE EMPLEADORES', 'no', 839);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('94120', 'ACTIVIDADES DE ORGANIZACIONES PROFESIONALES', 'no', 840);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('94200', 'ACTIVIDADES DE SINDICATOS', 'no', 841);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('94910', 'ACTIVIDADES DE ORGANIZACIONES RELIGIOSAS', 'no', 842);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('94920', 'ACTIVIDADES DE ORGANIZACIONES POLÍTICAS', 'no', 843);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('94990', 'ACTIVIDADES DE ASOCIACIONES N.C.P.', 'no', 844);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95110', 'REPARACIÓN DE COMPUTADORAS Y EQUIPO PERIFÉRICO', 'no', 846);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95120', 'REPARACIÓN DE EQUIPO DE COMUNICACIÓN', 'no', 847);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95210', 'REPARACIÓN DE APARATOS ELECTRÓNICOS DE CONSUMO', 'no', 848);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95220', 'REPARACIÓN DE APARATOS DOMÉSTICO Y EQUIPO DE HOGAR Y JARDÍN', 'no', 849);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95230', 'REPARACIÓN DE CALZADO Y ARTÍCULOS DE CUERO', 'no', 850);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95240', 'REPARACIÓN DE MUEBLES Y ACCESORIOS PARA EL HOGAR', 'no', 851);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95291', 'REPARACIÓN DE INSTRUMENTOS MUSICALES', 'no', 852);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95292', 'SERVICIOS DE CERRAJERÍA Y COPIADO DE LLAVES', 'no', 853);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95293', 'REPARACIÓN DE JOYAS Y RELOJES', 'no', 854);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95294', 'REPARACIÓN DE BICICLETAS, SILLAS DE RUEDAS Y RODADOS N.C.P.', 'no', 855);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('95299', 'REPARACIONES DE ENSERES PERSONALES N.C.P.', 'no', 856);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('96010', 'LAVADO Y LIMPIEZA DE PRENDAS DE TELA Y DE PIEL, INCLUSO LA LIMPIEZA EN SECO', 'no', 858);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('96020', 'PELUQUERÍA Y OTROS TRATAMIENTOS DE BELLEZA', 'no', 859);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('96030', 'POMPAS FÚNEBRES Y ACTIVIDADES CONEXAS', 'no', 860);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('96091', 'SERVICIOS DE SAUNA Y OTROS SERVICIOS PARA LA ESTÉTICA CORPORAL N.C.P.', 'no', 861);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('96092', 'SERVICIOS N.C.P.', 'no', 862);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('97000', 'ACTIVIDAD DE LOS HOGARES EN CALIDAD DE EMPLEADORES DE PERSONAL DOMÉSTICO', 'no', 865);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('98100', 'ACTIVIDADES INDIFERENCIADAS DE PRODUCCIÓN DE BIENES DE LOS HOGARES PRIVADOS PARA USO PROPIO', 'no', 867);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('98200', 'ACTIVIDADES INDIFERENCIADAS DE PRODUCCIÓN DE SERVICIOS DE LOS HOGARES PRIVADOS PARA USO PROPIO', 'no', 868);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('99000', 'ACTIVIDADES DE ORGANIZACIONES Y ÓRGANOS EXTRATERRITORIALES', 'no', 870);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_1', 'AGRICULTURA, GANADERÍA, SILVICULTURA Y PESCA', 'si', 1);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_132', 'ELABORACIÓN DE BEBIDAS', 'si', 132);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_141', 'ELABORACIÓN DE PRODUCTOS DE TABACO', 'si', 141);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_143', 'FABRICACIÓN DE PRODUCTOS TEXTILES', 'si', 143);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_159', 'FABRICACIÓN DE PRENDAS DE VESTIR', 'si', 159);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_172', 'FABRICACIÓN DE CUEROS Y PRODUCTOS CONEXOS', 'si', 172);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_181', 'PRODUCCIÓN DE MADERA Y FABRICACIÓN DE PRODUCTOS DE MADERA Y CORCHO EXCEPTO MUEBLES; FABRICACIÓN DE ARTÍCULOS DE PAJA Y DE MATERIALES TRENZABLES', 'si', 181);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_188', 'FABRICACIÓN DE PAPEL Y DE PRODUCTOS DE PAPEL', 'si', 188);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_193', 'IMPRESIÓN Y REPRODUCCIÓN DE GRABACIONES', 'si', 193);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_197', 'FABRICACIÓN DE COQUE Y DE PRODUCTOS DE LA REFINACIÓN DE PETRÓLEO', 'si', 197);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_2', 'PRODUCCIÓN AGRÍCOLA, PECUARIA, CAZA Y ACTIVIDADES DE SERVICIOS CONEXAS ', 'si', 2);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_201', 'FABRICACIÓN DE SUSTANCIAS Y PRODUCTOS QUÍMICOS', 'si', 201);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_217', 'FABRICACIÓN DE PRODUCTOS FARMACÉUTICOS, SUSTANCIAS QUÍMICAS MEDICINALES Y PRODUCTOS BOTÁNICOS DE USO FARMACÉUTICO', 'si', 217);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_220', 'FABRICACIÓN DE PRODUCTOS DE CAUCHO Y PLÁSTICO', 'si', 220);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_227', 'FABRICACIÓN DE PRODUCTOS MINERALES NO METÁLICOS', 'si', 227);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_240', 'FABRICACIÓN DE METALES COMUNES', 'si', 240);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_245', 'FABRICACIÓN DE PRODUCTOS DERIVADOS DE METAL, EXCEPTO MAQUINARIA Y EQUIPO', 'si', 245);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_257', 'FABRICACIÓN DE PRODUCTOS DE INFORMÁTICA, ELECTRÓNICA Y ÓPTICA', 'si', 257);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_267', 'FABRICACIÓN DE EQUIPO ELÉCTRICO', 'si', 267);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_276', 'FABRICACIÓN DE MAQUINARIA Y EQUIPO NCP', 'si', 276);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_294', 'FABRICACIÓN DE VEHÍCULOS AUTOMOTORES, REMOLQUES Y SEMIRREMOLQUES', 'si', 294);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_298', 'FABRICACIÓN DE OTROS TIPOS DE EQUIPO DE TRANSPORTE', 'si', 298);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_307', 'FABRICACIÓN DE MUEBLES', 'si', 307);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_312', 'OTRAS INDUSTRIAS MANUFACTURERAS', 'si', 312);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_329', 'REPARACIÓN E INSTALACIÓN DE MAQUINARIA Y EQUIPO', 'si', 329);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_337', 'SUMINISTROS DE ELECTRICIDAD, GAS, VAPOR Y AIRE ACONDICIONADO', 'si', 337);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_343', 'SUMINISTRO DE AGUA, EVACUACIÓN DE AGUAS RESIDUALES (ALCANTARILLADO); GESTIÓN DE DESECHOS Y ACTIVIDADES DE SANEAMIENTO', 'si', 343);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_344', 'CAPTACIÓN, TRATAMIENTO Y SUMINISTRO DE AGUA', 'si', 344);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_346', 'EVACUACIÓN DE AGUAS RESIDUALES (ALCANTARILLADO)', 'si', 346);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_348', 'RECOLECCIÓN, TRATAMIENTO Y ELIMINACIÓN DE DESECHOS; RECICLAJE', 'si', 348);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_359', 'ACTIVIDADES DE SANEAMIENTO Y OTROS SERVICIOS DE GESTIÓN DE DESECHOS', 'si', 359);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_361', 'CONSTRUCCIÓN', 'si', 361);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_362', 'CONSTRUCCIÓN DE EDIFICIOS', 'si', 362);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_365', 'OBRAS DE INGENIERÍA CIVIL', 'si', 365);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_369', 'ACTIVIDADES ESPECIALIZADAS DE CONSTRUCCIÓN', 'si', 369);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_378', 'COMERCIO AL POR MAYOR Y AL POR MENOR; REPARACIÓN DE VEHÍCULOS AUTOMOTORES Y MOTOCICLETAS', 'si', 378);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_395', 'COMERCIO AL POR MAYOR, EXCEPTO EL COMERCIO DE VEHÍCULOS AUTOMOTORES Y MOTOCICLETAS (PARTE 1)', 'si', 395);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_483', 'COMERCIO AL POR MAYOR, EXCEPTO EL COMERCIO DE VEHÍCULOS AUTOMOTORES Y MOTOCICLETAS (PARTE 2)', 'si', 483);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_497', 'COMERCIO AL POR MENOR, EXCEPTO DE VEHÍCULOS AUTOMOTORES Y MOTOCICLETAS', 'si', 497);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_578', 'TRANSPORTE Y ALMACENAMIENTO', 'si', 578);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_579', 'TRANSPORTE POR VÍA TERRESTRE Y TRANSPORTE POR TUBERÍAS', 'si', 579);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_59', 'SILVICULTURA Y EXTRACCIÓN DE MADERA', 'si', 59);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_598', 'TRANSPORTE POR VÍA ACUÁTICA', 'si', 598);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_604', 'TRANSPORTE POR VÍA AÉREA', 'si', 604);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_608', 'ALMACENAMIENTO Y ACTIVIDADES DE APOYO AL TRANSPORTE', 'si', 608);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_621', 'ACTIVIDADES POSTALES Y DE MENSAJERÍA', 'si', 621);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_624', 'ACTIVIDADES DE ALOJAMIENTO Y DE SERVICIO DE COMIDAS', 'si', 624);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_625', 'ACTIVIDADES DE ALOJAMIENTO', 'si', 625);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_630', 'ACTIVIDADES DE SERVICIO DE COMIDAS Y BEBIDAS', 'si', 630);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_64', 'PESCA Y ACUICULTURA ', 'si', 64);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_642', 'INFORMACIÓN Y COMUNICACIONES', 'si', 642);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_643', 'ACTIVIDADES DE EDICIÓN', 'si', 643);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_649', 'ACTIVIDADES DE PRODUCCIÓN DE PELÍCULAS CINEMATOGRÁFICAS, VIDEOS Y PROGRAMAS DE TELEVISIÓN, GRABACIÓN DE SONIDO Y EDICIÓN DE MÚSICA', 'si', 649);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_655', 'ACTIVIDADES DE PROGRAMACIÓN Y TRANSMISIÓN', 'si', 655);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_661', 'TELECOMUNICACIONES', 'si', 661);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_672', 'PROGRAMACIÓN INFORMÁTICA, CONSULTORÍA INFORMÁTICA Y ACTIVIDADES CONEXAS', 'si', 672);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_676', 'ACTIVIDADES DE SERVICIOS DE INFORMACIÓN', 'si', 676);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_681', 'ACTIVIDADES FINANCIERAS Y DE SEGUROS', 'si', 681);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_682', 'ACTIVIDADES DE SERVICIOS FINANCIEROS EXCEPTO LAS DE SEGUROS Y FONDOS DE PENSIONES', 'si', 682);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_695', 'SEGUROS, REASEGUROS Y FONDOS DE PENSIONES, EXCEPTO PLANES DE SEGURIDAD SOCIAL DE AFILIACIÓN OBLIGATORIA.', 'si', 695);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_70', 'EXPLOTACIÓN DE MINAS Y CANTERAS', 'si', 70);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_701', 'ACTIVIDADES AUXILIARES DE LAS ACTIVIDADES DE SERVICIOS FINANCIEROS', 'si', 701);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_709', 'ACTIVIDADES INMOBILIARIAS', 'si', 709);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_71', 'EXTRACCIÓN CARBÓN DE PIEDRA Y LIGNITO', 'si', 71);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_713', 'ACTIVIDADES PROFESIONALES, CIENTÍFICAS Y TÉCNICAS', 'si', 713);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_714', 'ACTIVIDADES JURÍDICAS Y CONTABLES', 'si', 714);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_717', 'ACTIVIDADES DE OFICINAS CENTRALES; ACTIVIDADES DE CONSULTORÍA EN GESTIÓN EMPRESARIAL', 'si', 717);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_720', 'ACTIVIDADES DE ARQUITECTURA E INGENIERÍA; ENSAYOS Y ANÁLISIS TÉCNICOS', 'si', 720);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_725', 'INVESTIGACIÓN CIENTÍFICA Y DESARROLLO', 'si', 725);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_729', 'PUBLICIDAD Y ESTUDIOS DE MERCADO', 'si', 729);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_732', 'OTRAS ACTIVIDADES PROFESIONALES, CIENTÍFICAS Y TÉCNICAS', 'si', 732);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_736', 'ACTIVIDADES VETERINARIAS', 'si', 736);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_738', 'ACTIVIDADES DE SERVICIOS ADMINISTRATIVOS Y DE APOYO', 'si', 738);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_739', 'ACTIVIDADES DE ALQUILER Y ARRENDAMIENTO', 'si', 739);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_74', 'EXTRACCIÓN DE PETRÓLEO CRUDO Y GAS NATURAL ', 'si', 74);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_748', 'ACTIVIDADES DE EMPLEO', 'si', 748);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_752', 'ACTIVIDADES DE AGENCIAS DE VIAJES, OPERADORES TURÍSTICOS Y OTROS SERVICIOS DE RESERVA Y ACTIVIDADES CONEXAS', 'si', 752);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_756', 'ACTIVIDADES DE INVESTIGACIÓN Y SEGURIDAD', 'si', 756);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_761', 'ACTIVIDADES DE SERVICIOS A EDIFICIOS Y PAISAJISMO', 'si', 761);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_766', 'ACTIVIDADES ADMINISTRATIVAS Y DE APOYO DE OFICINAS Y OTRAS ACTIVIDADES DE APOYO A LAS EMPRESAS', 'si', 766);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_77', 'EXTRACCIÓN DE MINERALES METALÍFEROS ', 'si', 77);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_776', 'ADMINISTRACIÓN PÚBLICA Y DEFENSA; PLANES DE SEGURIDAD SOCIAL DE AFILIACIÓN OBLIGATORIA', 'si', 776);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_785', 'ENSEÑANZA', 'si', 785);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_802', 'ACTIVIDADES DE ATENCIÓN A LA SALUD HUMANA Y DE ASISTENCIA SOCIAL', 'si', 802);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_803', 'ACTIVIDADES DE ATENCIÓN DE LA SALUD HUMANA', 'si', 803);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_81', 'EXPLOTACIÓN DE OTRAS MINAS Y CANTERAS ', 'si', 81);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_811', 'ACTIVIDADES DE ATENCIÓN DE ENFERMERÍA EN INSTITUCIONES', 'si', 811);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_817', 'ACTIVIDADES DE ASISTENCIA SOCIAL SIN ALOJAMIENTO', 'si', 817);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_820', 'ACTIVIDADES ARTÍSTICAS, DE ENTRETENIMIENTO Y RECREATIVAS', 'si', 820);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_821', 'ACTIVIDADES CREATIVAS ARTÍSTICAS Y DE ESPARCIMIENTO', 'si', 821);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_823', 'ACTIVIDADES BIBLIOTECAS, ARCHIVOS, MUSEOS Y OTRAS ACTIVIDADES CULTURALES', 'si', 823);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_827', 'ACTIVIDADES DE JUEGOS DE AZAR Y APUESTAS', 'si', 827);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_829', 'ACTIVIDADES DEPORTIVAS, DE ESPARCIMIENTO Y RECREATIVAS', 'si', 829);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_837', 'OTRAS ACTIVIDADES DE SERVICIOS', 'si', 837);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_838', 'ACTIVIDADES DE ASOCIACIONES', 'si', 838);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_845', 'REPARACIÓN DE COMPUTADORAS Y DE EFECTOS PERSONALES Y ENSERES DOMÉSTICOS', 'si', 845);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_857', 'OTRAS ACTIVIDADES DE SERVICIOS PERSONALES', 'si', 857);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_863', 'ACTIVIDADES DE LOS HOGARES COMO EMPLEADORES, ACTIVIDADES INDIFERENCIADAS DE PRODUCCIÓN DE BIENES Y SERVICIOS DE LOS HOGARES PARA USO PROPIO', 'si', 863);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_864', 'ACTIVIDAD DE LOS HOGARES EN CALIDAD DE EMPLEADORES DE PERSONAL DOMESTICO', 'si', 864);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_866', 'ACTIVIDADES INDIFERENCIADAS DE PRODUCCIÓN DE BIENES Y SERVICIOS DE LOS HOGARES PARA USO PROPIO', 'si', 866);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_869', 'ACTIVIDADES DE ORGANIZACIONES Y ÓRGANOS EXTRATERRITORIALES', 'si', 869);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_87', 'ACTIVIDADES DE SERVICIOS DE APOYO A LA EXPLOTACIÓN DE MINAS Y CANTERAS ', 'si', 87);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_871', 'EMPLEADOS Y OTRAS PERSONAS NATURALES', 'si', 871);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_90', 'INDUSTRIAS MANUFACTURERAS', 'si', 90);
INSERT INTO contabilidad.actividad_economica (actie_id, actie_nombre, actie_padre, actie_orden) VALUES ('_91', 'ELABORACIÓN DE PRODUCTOS ALIMENTICIOS ', 'si', 91);
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('01', 'Billetes y monedas', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('02', 'Tarjeta Débito', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('03', 'Tarjeta Crédito', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('04', 'Cheque', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('05', 'Transferencia_ Depósito Bancario', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('06', 'Vales o Cupones', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('08', 'Dinero electrónico', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('09', 'Monedero electrónico', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('10', 'Certificado o tarjeta de regalo', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('11', 'Bitcoin', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('12', 'Otras Criptomonedas', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('13', 'Cuentas por pagar del receptor', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('14', 'Giro bancario', 'Active');
INSERT INTO contabilidad.forma_pago (forp_id, forp_nombre, forp_status) VALUES ('99', 'Otros (se debe indicar el medio de pago) ', 'Active');
INSERT INTO contabilidad.plazo (plazo_id, plazo_nombre) VALUES ('01', 'Días');
INSERT INTO contabilidad.plazo (plazo_id, plazo_nombre) VALUES ('02', 'Meses');
INSERT INTO contabilidad.plazo (plazo_id, plazo_nombre) VALUES ('03', 'Años');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('01', 'Terrestre San Bartolo');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('02', 'Marítima de Acajutla');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('03', 'Aérea Monseñor Óscar Arnulfo Romero');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('04', 'Terrestre Las Chinamas');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('05', 'Terrestre La Hachadura');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('06', 'Terrestre Santa Ana');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('07', 'Terrestre San Cristóbal');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('08', 'Terrestre Anguiatú');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('09', 'Terrestre El Amatillo');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('10', 'Marítima La Unión (Puerto Cutuco)');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('11', 'Terrestre El Poy');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('12', 'Aduana Terrestre Metalío');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('15', 'Fardos Postales');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('16', 'Z.F. San Marcos');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('17', 'Z.F. El Pedregal');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('18', 'Z.F. San Bartolo');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('20', 'Z.F. Exportsalva');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('21', 'Z.F. American Park');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('23', 'Z.F. Internacional');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('24', 'Z.F. Diez');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('26', 'Z.F. Miramar');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('27', 'Z.F. Santo Tomas');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('28', 'Z.F. Santa Tecla');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('29', 'Z.F. Santa Ana');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('30', 'Z.F. La Concordia');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('31', 'Aérea Ilopango');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('32', 'Z.F. Pipil');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('33', 'Puerto Barillas');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('34', 'Z.F. Calvo Conservas');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('35', 'Feria Internacional');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('36', 'Delg. Aduana El Papalón');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('37', 'Z.F. Parque Industrial Sam-Li');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('38', 'Z.F. San José');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('39', 'Z.F. Las Mercedes');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('71', 'Almacenes De Desarrollo (Aldesa)');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('72', 'Almac. Gral. Dep. Occidente (Agdosa)');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('73', 'Bodega General De Depósito (Bodesa)');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('76', 'DHL');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('77', 'Transauto (Santa Elena)');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('80', 'Almacenadora Nejapa, S.a. de C.V.');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('81', 'Almacenadora Almaconsa S.A. De C.V.');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('83', 'Alm.Gral. Depósito Occidente (Apopa)');
INSERT INTO contabilidad.recinto_fiscal (refisc_id, refisc_nombre) VALUES ('99', 'San Bartolo Envío Hn/Gt ');
INSERT INTO contabilidad.tipo_contingencia (tconting_id, tconting_nombre) VALUES ('1', 'No disponibilidad de sistema del MH');
INSERT INTO contabilidad.tipo_contingencia (tconting_id, tconting_nombre) VALUES ('2', 'No disponibilidad de sistema del emisor');
INSERT INTO contabilidad.tipo_contingencia (tconting_id, tconting_nombre) VALUES ('3', 'Falla en el suministro de servicio de Internet del Emisor');
INSERT INTO contabilidad.tipo_contingencia (tconting_id, tconting_nombre) VALUES ('4', 'Falla en el suministro de servicio de energía eléctrica del emisor que impida la transmisión de los DTE');
INSERT INTO contabilidad.tipo_contingencia (tconting_id, tconting_nombre) VALUES ('5', 'Otro (deberá digitar un máximo de 500 caracteres explicando el motivo) ');
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('01', 'Factura de consumidor final', 'Activo', 'FE', '1');
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('03', 'Comprobante de crédito fiscal', 'Activo', 'CCFE', '3');
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('04', 'Nota de remisión', 'Activo', 'NRE', '3');
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('05', 'Nota de crédito', 'Activo', 'NCE', '3');
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('06', 'Nota de débito', 'Activo', 'NDE', '3');
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('07', 'Comprobante de retención', 'Inactivo', null, null);
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('08', 'Comprobante de liquidación', 'Inactivo', null, null);
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('09', 'Documento contable de liquidación', 'Inactivo', null, null);
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('11', 'Facturas de exportación', 'Activo', 'FEXE', '1');
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('14', 'Factura de sujeto excluido', 'Activo', 'FSE', '1');
INSERT INTO contabilidad.tipo_documento (tipodoc_id, tipodoc_nombre, tipodoc_estado, tipodoc_codigo, version_json) VALUES ('15', 'Comprobante de donación ', 'Inactivo', null, null);
INSERT INTO contabilidad.tipo_invalidacion (id, tipo_invalidacion_nombre) VALUES (1, 'Error en la Información del Documento Tributario Electrónico a invalidar.');
INSERT INTO contabilidad.tipo_invalidacion (id, tipo_invalidacion_nombre) VALUES (2, 'Rescindir de la operación realizada.');
INSERT INTO contabilidad.tipo_invalidacion (id, tipo_invalidacion_nombre) VALUES (3, 'Otro');
INSERT INTO contabilidad.tipo_establecimiento (tipoest_id, tipoest_nombre) VALUES ('01', 'Sucursal / Agencia');
INSERT INTO contabilidad.tipo_establecimiento (tipoest_id, tipoest_nombre) VALUES ('02', 'Casa matriz');
INSERT INTO contabilidad.tipo_establecimiento (tipoest_id, tipoest_nombre) VALUES ('04', 'Bodega');
INSERT INTO contabilidad.tipo_establecimiento (tipoest_id, tipoest_nombre) VALUES ('07', 'Patio');
INSERT INTO contabilidad.tipo_establecimiento (tipoest_id, tipoest_nombre) VALUES ('20', 'Otro ');
INSERT INTO contabilidad.tipo_item (tipoitem_id, tipoitem_nombre) VALUES ('1', 'Bienes');
INSERT INTO contabilidad.tipo_item (tipoitem_id, tipoitem_nombre) VALUES ('2', 'Servicios');
INSERT INTO contabilidad.tipo_item (tipoitem_id, tipoitem_nombre) VALUES ('3', 'Ambos (Bienes y Servicios, incluye los dos inherente a los Productos o servicios)');
INSERT INTO contabilidad.tipo_item (tipoitem_id, tipoitem_nombre) VALUES ('4', 'Otros tributos por ítem ');
INSERT INTO contabilidad.tipo_transmision (tipotrans_id, tipotrans_nombre) VALUES ('1', 'Transmisión normal');
INSERT INTO contabilidad.tipo_transmision (tipotrans_id, tipotrans_nombre) VALUES ('2', 'Transmisión por contingencia ');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('01', 'Metro');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('02', 'Yarda');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('03', 'Vara');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('04', 'Pie');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('05', 'Pulgada');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('06', 'Milímetro');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('08', 'Milla cuadrada ');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('09', 'Kilómetro cuadrado');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('10', 'Hectárea');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('11', 'Manzana');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('12', 'Acre');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('13', 'Metro cuadrado');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('14', 'Yarda cuadrada');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('15', 'Vara cuadrada');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('16', 'Pie cuadrado');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('17', 'Pulgada cuadrada');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('18', 'Metro cúbico');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('19', 'Yarda cúbica');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('20', 'Barril');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('21', 'Pie cúbico');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('22', 'Galón');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('23', 'Litro');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('24', 'Botella');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('25', 'Pulgada cúbica');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('26', 'Mililitro');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('27', 'Onza fluida');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('29', 'Tonelada métrica');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('30', 'Tonelada');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('31', 'Quintal métrico');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('32', 'Quintal');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('33', 'Arroba');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('34', 'Kilogramo');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('35', 'Libra troy');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('36', 'Libra');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('37', 'Onza troy');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('38', 'Onza');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('39', 'Gramo');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('40', 'Miligramo');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('42', 'Megawatt');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('43', 'Kilowatt');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('44', 'Watt');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('45', 'Megavoltio-amperio');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('46', 'Kilovoltio-amperio');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('47', 'Voltio-amperio');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('49', 'Gigawatt-hora');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('50', 'Megawatt-hora ');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('51', 'Kilowatt-hora');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('52', 'Watt-hora');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('53', 'Kilovoltio');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('54', 'Voltio');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('55', 'Millar');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('56', 'Medio millar');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('57', 'Ciento');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('58', 'Docena');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('59', 'Unidad');
INSERT INTO contabilidad.unidades_medida (unim_id, unim_nombre) VALUES ('99', 'Otra');
INSERT INTO contabilidad.modelo_facturacion (modfact_id, modfact_nombre) VALUES ('1', 'Modelo Facturación previo');
INSERT INTO contabilidad.modelo_facturacion (modfact_id, modfact_nombre) VALUES ('2', 'Modelo Facturación diferido ');
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('-1', 'No enviado', null);
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('000', 'EN CONTIGENCIA', null);
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('001', 'RECIBIDO', 'PROCESADO');
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('002', 'RECIBIDO CON OBSERVACIONES', 'PROCESADO');
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('004', 'YA EXISTE UN REGISTRO CON ESE VALOR', 'RECHAZADO');
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('022', 'SERVICIO DE VALIDACION DE FIRMA NO DISPONIBLE', null);
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('099', 'ERROR NO CATALOGADO', 'RECHAZADO');
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('101', 'ERROR CONTACTAR CON SOPORTE TECNICO', null);
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('102', 'ERROR NO SE PUDO AUTENTICAR EL USUARIO', null);
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('103', 'CONTRASEÑA EXPIRADA, POR FAVOR ACTUALIZAR /auth/update-password', null);
INSERT INTO contabilidad.invoice_status_mh (iemh_id, iemh_mensaje, iemh_estado) VALUES ('106', 'CREDENCIALES INVALIDAS', null);
INSERT INTO contabilidad.condicion_operacion (conop_id, conop_nombre) VALUES ('1', 'Contado');
INSERT INTO contabilidad.condicion_operacion (conop_id, conop_nombre) VALUES ('2', 'A crédito');
INSERT INTO contabilidad.condicion_operacion (conop_id, conop_nombre) VALUES ('3', 'Otro ');
INSERT INTO contabilidad.block_dtes (id, type_dte, correlativo, created_at, updated_at) VALUES (1, '01', '1', null, '2026-01-14 16:28:59.0');
INSERT INTO contabilidad.block_dtes (id, type_dte, correlativo, created_at, updated_at) VALUES (2, '03', '29', null, '2026-02-06 16:06:38.0');
INSERT INTO contabilidad.block_dtes (id, type_dte, correlativo, created_at, updated_at) VALUES (3, '05', '1', null, '2026-01-14 13:13:48.0');
INSERT INTO contabilidad.block_dtes (id, type_dte, correlativo, created_at, updated_at) VALUES (4, '06', '1', null, '2024-06-08 08:31:16.0');
INSERT INTO contabilidad.block_dtes (id, type_dte, correlativo, created_at, updated_at) VALUES (5, '04', '1', null, '2026-01-14 17:09:55.0');
INSERT INTO contabilidad.block_dtes (id, type_dte, correlativo, created_at, updated_at) VALUES (6, '11', '15', null, '2026-02-12 10:00:54.0');
INSERT INTO contabilidad.block_dtes (id, type_dte, correlativo, created_at, updated_at) VALUES (7, '14', '5', null, '2026-02-09 15:09:45.0');

## Estructura de Clientes ESTA SI DEBE LLEVAR company_id
create table contabilidad.customers
(
    id                 bigint unsigned auto_increment
        primary key,
	company_id		   bigint unsigned,
    company_name       varchar(255)                                         null comment 'Nombre o razón social',
    tradename          varchar(255)                                         null comment 'nombre comercial',
    contact_name       varchar(50)                                          null,
    contact_email      varchar(100)                                         null,
    contact_phone      varchar(20)                                          null,
    pais_id            varchar(255) collate utf8mb4_general_ci              null,
    zip                varchar(20)                                          null,
    address            text                                                 null,
    facebook           varchar(191)                                         null,
    twitter            varchar(191)                                         null,
    linkedin           varchar(191)                                         null,
    remarks            text                                                 null,
    contact_image      varchar(191)                                         null,
    group_id           bigint                                               null,
    user_id            bigint                                               null,
    company_id         bigint                                               not null,
    created_at         timestamp                                            null,
    updated_at         timestamp                                            null,
    nit                varchar(100)                                         null,
    ncf                varchar(100)                                         null,
    business_line      varchar(100)                                         null,
    nrc                varchar(100)                                         null,
    tpers_id           varchar(255) collate utf8mb4_general_ci default '1'  not null,
    dui                varchar(255)                                         null comment 'dui del cliente caso personal natural',
    munidepa_id        bigint unsigned                                      null comment 'hace referencia al campo dist_id de la tabla distritos, anteriormente referenciaba a municipios',
    depa_id            varchar(255) collate utf8mb4_general_ci              null comment 'tabla departamento FE',
    actie_id           varchar(255) charset utf8mb3                         null comment 'ref actividad_economica FE',
    plazo_id           varchar(255) collate utf8mb4_general_ci              null comment 'ref tabla plazo',
    payment_period     int                                                  null,
    exento_iva         enum ('si', 'no')                       default 'no' null,
    nosujeto_iva       enum ('si', 'no')                       default 'no' null,
    gran_contribuyente enum ('si', 'no')                       default 'no' null,
    descActividad      varchar(200)                                         null,
    firstName          varchar(50)                                          null,
    lastName           varchar(50)                                          null,
    constraint contacts_ibfk_1
        foreign key (actie_id) references contabilidad.actividad_economica (actie_id),
    constraint contacts_ibfk_2
        foreign key (pais_id) references contabilidad.paises (pais_id),
    constraint contacts_ibfk_3
        foreign key (tpers_id) references contabilidad.tipo_persona (tpers_id),
    constraint contacts_ibfk_4
        foreign key (depa_id) references contabilidad.departamentos (depa_id),
    constraint contacts_munidepa_id_foreign
        foreign key (munidepa_id) references contabilidad.districts (dist_id)
            on update cascade
)
    engine = InnoDB
    collate = utf8mb4_unicode_ci;

create index actie_id
    on contabilidad.contacts (actie_id);

create index depa_id
    on contabilidad.contacts (depa_id);

create index munidepa_id
    on contabilidad.contacts (munidepa_id);

create index pais_id
    on contabilidad.contacts (pais_id);

create index tpers_id
    on contabilidad.contacts (tpers_id);

