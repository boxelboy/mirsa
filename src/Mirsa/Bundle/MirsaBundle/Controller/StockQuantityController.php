<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Mirsa\Bundle\MirsaBundle\Entity\StockQuantity;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * StockController
 *
 * @author Dave Hatch
 * @link   
 */
class StockQuantityController extends Controller
{
    /**
     * List all stock quantities
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:StockQuantity:list.html.twig');
    }
    
    /* Used to export the Stock records, this will also work with the filters */
    public function exportAction(Request $request)
    {
        $sku = $request->query->get('sku');
        $description = $request->query->get('description');
        $batchNumber = $request->query->get('batchNumber');
        $warehouseName = $request->query->get('warehouseName');
        $aisleName = $request->query->get('aisleName');
        $bayName = $request->query->get('bayName');
        

        $response = new StreamedResponse();
        $response->setCallback(function() use (&$sku, &$description, &$batchNumber, &$warehouseName, &$aisleName, &$bayName) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('Sku', 'Description', 'Batch Number', 'Warehouse Name', 'Aisle Name', 'Bay Name', 'Quantity'),',');
            
            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:StockQuantity');
            $qb = $qb->createQueryBuilder('sq');
            $qb = $qb->select('sq.sku,sq.description,sq.batchNumber,sq.warehouseName,sq.aisleName,sq.bayName,sq.quantity');
            if ($sku != "" ) {
                var_dump($sku);
                $qb = $qb->andWhere('LOWER(sq.sku) LIKE :sku');
                $qb = $qb->setParameter('sku', '%' . strtolower($sku) . '%');
            }
            if ($description != "" ) {
                var_dump($description);
                $qb = $qb->andWhere('LOWER(sq.description) LIKE :description');
                $qb = $qb->setParameter('description', '%' . strtolower($description) . '%');
            }
            if ($batchNumber != "" ) {
                var_dump($batchNumber);
                $qb = $qb->andWhere('LOWER(sq.batchNumber) LIKE :batchnumber');
                $qb = $qb->setParameter('batchnumber', '%' . strtolower($batchNumber) . '%');
            }
            if ($warehouseName != "" ) {
                $qb = $qb->andWhere('LOWER(sq.warehouseName) LIKE :warehousename');
                $qb = $qb->setParameter('warehousename', '%' . strtolower($warehouseName) . '%');
            }
            if ($aisleName != "" ) {
                $qb = $qb->andWhere('LOWER(sq.aisleName) LIKE :aislename');
                $qb = $qb->setParameter('aislename', '%' . strtolower($aisleName) . '%');
            }
            if ($bayName != "" ) {
                $qb = $qb->andWhere('LOWER(sq.bayName) LIKE :bayname');
                $qb = $qb->setParameter('bayname', '%' . strtolower($bayName) . '%');
            }

            if (!is_null($this->getUser()->getContact())) { 
                if ($this->getUser()->getContact()->getClient()) {
                    $qb = $qb->andWhere('sq.client = :client');
                    $qb = $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                }
            }
            $qb = $qb->getQuery();
            $stock = $qb->getResult();
            
            var_dump($stock);exit;

            foreach ($stock as $item) {
                fputcsv($fc, array(
                    $item['sku'],
                    $item['description'],
                    $item['batchNumber'],
                    $item['warehouseName'],
                    $item['aisleName'],
                    $item['bayName'],
                    $item['quantity']),
                ',');
            }
            fclose($fc);
        });

        $filename = "batch_export_".date("m_d_Y_His").".csv";
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename=' . $filename);
        return $response;
    }    
}